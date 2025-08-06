const agentBalanceModel = require('../models/agentBalanceModel');

// Récupère tous les soldes d’un agent
const getAgentBalances = async (req, res) => {
  try {
    const { agentId } = req.params;
    const balances = await agentBalanceModel.getBalancesByAgentId(agentId);
    res.json(balances);
  } catch (error) {
    console.error('Erreur lors de la récupération des soldes de l’agent :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Crée ou met à jour un solde d’un agent
const setOrUpdateAgentBalance = async (req, res) => {
  try {
    const { agentId, currencyId, balance } = req.body;

    if (!agentId || !currencyId || balance === undefined) {
      return res.status(400).json({ error: 'agentId, currencyId et balance sont requis' });
    }

    const result = await agentBalanceModel.setOrUpdateBalance(agentId, currencyId, balance);
    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du solde de l’agent :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  getAgentBalances,
  setOrUpdateAgentBalance,
};
