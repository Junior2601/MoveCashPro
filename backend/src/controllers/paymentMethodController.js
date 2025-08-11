const paymentMethodModel = require('../models/paymentMethodModel');

const createPaymentMethod = async (req, res) => {
  try {
    const { country_id, method } = req.body;

    if (!country_id || !method) {
      return res.status(400).json({
        error: 'Les champs country_id et method sont requis.'
      });
    }

    const newMethod = await paymentMethodModel.createPaymentMethod({
      country_id,
      method
    });

    res.status(201).json({
      message: 'Moyen de paiement créé avec succès.',
      payment_method: newMethod
    });
  } catch (err) {
    console.error('Erreur création moyen de paiement :', err);
    if (err.code === '23505') {
      return res.status(400).json({
        error: 'Ce moyen de paiement existe déjà pour ce pays.'
      });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  createPaymentMethod,
};
