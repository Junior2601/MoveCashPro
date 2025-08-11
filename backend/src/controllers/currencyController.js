const currencyModel = require('../models/currencyModel');

const createCurrency = async (req, res) => {
  try {
    const { code, name, symbol } = req.body;

    if (!code || !name || !symbol) {
      return res.status(400).json({ error: 'Tous les champs (code, name, symbol) sont requis.' });
    }

    const newCurrency = await currencyModel.createCurrency({ code, name, symbol });

    res.status(201).json({
      message: 'Devise créée avec succès.',
      currency: newCurrency,
    });
  } catch (err) {
    console.error('Erreur création devise :', err);
    if (err.code === '23505') { // violation contrainte unique
      return res.status(400).json({ error: 'Code de devise déjà existant.' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  createCurrency,
};
