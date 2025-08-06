const pool = require('../db');
const { generateTrackingCode } = require('../utils/trackingCode');
const transactionModel = require('../models/transactionModel');
const transactionHistoryModel = require('../models/transactionHistoryModel');
const agentGainModel = require('../models/agentGainModel');

const COMMISSION_PERCENT = 0.75;

exports.createTransaction = async (req, res) => {
  const {
    sender_country_id,
    sender_phone,
    payment_method,
    receiver_country_id,
    receiver_phone,
    reception_method,
    amount_sent,
    authorized_number_id = null // Optionnel avec valeur par défaut
  } = req.body;

  if (!sender_country_id || !sender_phone || !payment_method || !receiver_country_id || !receiver_phone || !reception_method || !amount_sent) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Générer un code de suivi unique avec limite de tentatives
    let tracking_code;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;
    
    while (attempts < MAX_ATTEMPTS) {
      tracking_code = generateTrackingCode();
      const check = await client.query(`SELECT 1 FROM transactions WHERE tracking_code = $1`, [tracking_code]);
      if (check.rowCount === 0) break;
      attempts++;
    }
    
    if (attempts >= MAX_ATTEMPTS) {
      throw new Error('Impossible de générer un code de suivi unique');
    }

    // Récupérer taux et devise avec mapping country -> currency
    const rateRes = await client.query(
      `SELECT r.rate, sc.currency_id as sender_currency_id, rc.currency_id as receiver_currency_id
       FROM rates r
       JOIN countries sc ON sc.id = $1
       JOIN countries rc ON rc.id = $2
       WHERE r.sending_country_id = $1 AND r.receiving_country_id = $2 
       ORDER BY r.created_at DESC LIMIT 1`,
      [sender_country_id, receiver_country_id]
    );
    
    if (rateRes.rowCount === 0) {
      throw new Error('Taux de change non trouvé pour cette paire de pays.');
    }

    const { rate: exchange_rate, sender_currency_id, receiver_currency_id } = rateRes.rows[0];
    const amount_received = Number(amount_sent) * exchange_rate;
    const commission_percent = COMMISSION_PERCENT;
    const agent_gain = Math.round(amount_received * (commission_percent / 100));
    const company_margin = Math.round(amount_received * 0.05); // exemple 5%

    // Sélection d'un agent avec la bonne currency_id
    const agentRes = await client.query(
      `SELECT a.id, a.name, b.balance 
       FROM agents a 
       JOIN agent_balances b ON a.id = b.agent_id
       WHERE b.currency_id = $1 AND b.balance >= $2 AND a.status = 'active'
       ORDER BY b.balance DESC 
       LIMIT 1`,
      [sender_currency_id, amount_sent] // Utilise sender_currency_id au lieu de sender_country_id
    );
    
    if (agentRes.rowCount === 0) {
      throw new Error(`Aucun agent disponible avec suffisamment de fonds en devise ${sender_currency_id}.`);
    }

    const agent_id = agentRes.rows[0].id;

    // Gestion conditionnelle d'authorized_number_id
    let finalAuthorizedNumberId = authorized_number_id;
    
    // Si un numéro autorisé est fourni, vérifier qu'il existe et est valide
    if (authorized_number_id) {
      const authNumberRes = await client.query(
        `SELECT id, status FROM authorized_numbers WHERE id = $1 AND agent_id = $2`,
        [authorized_number_id, agent_id]
      );
      
      if (authNumberRes.rowCount === 0) {
        throw new Error('Numéro autorisé introuvable pour cet agent.');
      }
      
      if (authNumberRes.rows[0].status !== 'active') {
        throw new Error('Le numéro autorisé n\'est pas actif.');
      }
    } else {
      // Si pas de numéro fourni, en assigner un automatiquement si nécessaire
      // (selon la logique métier de votre application)
      const autoAuthRes = await client.query(
        `SELECT id FROM authorized_numbers 
         WHERE agent_id = $1 AND status = 'active' AND auto_assign = true 
         LIMIT 1`,
        [agent_id]
      );
      
      if (autoAuthRes.rowCount > 0) {
        finalAuthorizedNumberId = autoAuthRes.rows[0].id;
      }
      // Sinon reste null si pas d'assignement automatique requis
    }

    // Insertion de la transaction avec authorized_number_id géré
    const transaction_id = await transactionModel.insertTransaction({
      client,
      tracking_code,
      sender_country_id,
      receiver_country_id,
      sender_phone,
      receiver_phone,
      payment_method,
      reception_method,
      amount_sent,
      amount_received,
      exchange_rate,
      commission_percent,
      agent_gain,
      company_margin,
      agent_id,
      authorized_number_id: finalAuthorizedNumberId // Peut être null ou un ID valide
    });

    // Historique
    await transactionHistoryModel.logTransactionHistory({
      transactionId: transaction_id,
      previousStatus: null,
      newStatus: 'en_attente',
      changedBy: null,
      changedByType: null,
      client
    });

    // Gain agent avec la bonne currency_id
    await agentGainModel.insertAgentGain({
      client,
      transactionId: transaction_id,
      agentId: agent_id,
      gainAmount: agent_gain,
      currencyId: receiver_currency_id // Utilise receiver_currency_id pour le gain
    });

    await client.query('COMMIT');

    res.status(201).json({
      transaction_id,
      tracking_code,
      amount_received,
      exchange_rate,
      agent_id,
      authorized_number_id: finalAuthorizedNumberId,
      sender_currency_id,
      receiver_currency_id,
      status: 'en_attente'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur transaction:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};