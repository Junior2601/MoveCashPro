const countryModel = require('../models/countryModel');


// plus tard faire la verification d'existance par nom
const createCountry = async (req, res) => {
  try {
    const { name, code, phone_prefix, currency_id } = req.body;

    if (!name || !code || !phone_prefix || !currency_id) {
      return res.status(400).json({
        error: 'Les champs name, code, phone_prefix et currency_id sont requis.'
      });
    }

    const newCountry = await countryModel.createCountry({
      name,
      code: code.toUpperCase(),
      phone_prefix,
      currency_id
    });

    res.status(201).json({
      message: 'Pays créé avec succès.',
      country: newCountry,
    });
  } catch (err) {
    console.error('Erreur création pays :', err);
    if (err.code === '23505') {
      return res.status(400).json({
        error: 'Le nom ou le code du pays existe déjà.'
      });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  createCountry,
};
