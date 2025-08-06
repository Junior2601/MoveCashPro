const agentGainModel = require('../models/agentGainModel');

// Ajouter un gain pour un agent
const insertAgentGain = async (req, res) => {
  try {
    const { agentId, transactionId, gainAmount, currencyId } = req.body;

    if (!agentId || !transactionId || !gainAmount || !currencyId) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const gain = await agentGainModel.insertAgentGain({
      agentId,
      transactionId,
      gainAmount,
      currencyId,
    });

    res.status(201).json(gain);
  } catch (error) {
    console.error('Erreur lors de l’insertion du gain :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer tous les gains d’un agent
const getGainsByAgent = async (req, res) => {
  try {
    const { agentId } = req.params;

    const gains = await agentGainModel.getGainsByAgent(agentId);

    res.status(200).json(gains);
  } catch (error) {
    console.error('Erreur lors de la récupération des gains :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  insertAgentGain,
  getGainsByAgent,
};
