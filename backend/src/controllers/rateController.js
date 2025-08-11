const rateModel = require('../models/rateModel');

const createRate = async (req, res) => {
  try {
    const { from_currency_id, to_currency_id, rate, commission_percent } = req.body;
    const created_by = req.admin?.id; // récupéré via middleware d’auth admin

    // Vérification basique
    if (!from_currency_id || !to_currency_id || !rate) {
      return res.status(400).json({ error: 'from_currency_id, to_currency_id et rate sont requis.' });
    }

    if (from_currency_id === to_currency_id) {
      return res.status(400).json({ error: 'Les devises source et destination doivent être différentes.' });
    }

    const newRate = await rateModel.createRate({
      from_currency_id,
      to_currency_id,
      rate,
      commission_percent: commission_percent || 0.75,
      created_by
    });

    res.status(201).json({
      message: 'Taux de change créé avec succès.',
      rate: newRate
    });
  } catch (err) {
    console.error('Erreur création taux :', err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Un taux pour cette paire existe déjà aujourd’hui.' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  createRate,
};
