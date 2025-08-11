const balanceModel = require('../models/balanceModel');

const createBalance = async (req, res) => {
  try {
    const { agent_id, currency_id, amount } = req.body;

    if (!agent_id || !currency_id) {
      return res.status(400).json({ error: 'agent_id et currency_id sont requis.' });
    }

    const newBalance = await balanceModel.createBalance({
      agent_id,
      currency_id,
      amount: amount || 0
    });

    res.status(201).json({
      message: 'Portefeuille créé avec succès.',
      balance: newBalance
    });
  } catch (err) {
    console.error('Erreur création portefeuille :', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Ce portefeuille existe déjà pour cet agent et cette devise.' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  createBalance
};
