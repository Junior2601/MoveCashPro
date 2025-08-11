const authorizedNumberModel = require('../models/authorizedNumberModel');

const createAuthorizedNumber = async (req, res) => {
  try {
    const { agent_id, country_id, payment_method_id, number, label } = req.body;

    if (!agent_id || !country_id || !payment_method_id || !number) {
      return res.status(400).json({ error: 'agent_id, country_id, payment_method_id et number sont requis.' });
    }

    const newAuthorizedNumber = await authorizedNumberModel.createAuthorizedNumber({
      agent_id,
      country_id,
      payment_method_id,
      number,
      label: label || null
    });

    res.status(201).json({
      message: 'Numéro autorisé créé avec succès.',
      authorized_number: newAuthorizedNumber
    });
  } catch (err) {
    console.error('Erreur création numéro autorisé :', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Un numéro existe déjà pour cet agent, pays et méthode de paiement.' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  createAuthorizedNumber,
};
