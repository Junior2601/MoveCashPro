const agentModel = require('../models/agentModel');

// Créer un nouvel agent
const createAgent = async (req, res) => {
  try {
    const { name, email, passwordHash, phone, countryId } = req.body;

    if (!name || !email || !passwordHash || !phone || !countryId) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const newAgent = await agentModel.createAgent({ name, email, passwordHash, phone, countryId });
    res.status(201).json(newAgent);
  } catch (error) {
    console.error('Erreur lors de la création de l’agent :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Obtenir un agent par email
const getAgentByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const agent = await agentModel.getAgentByEmail(email);

    if (!agent) {
      return res.status(404).json({ error: 'Agent introuvable.' });
    }

    res.status(200).json(agent);
  } catch (error) {
    console.error('Erreur lors de la récupération de l’agent :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer les balances d’un agent
const getAgentBalances = async (req, res) => {
  try {
    const { agentId } = req.params;
    const balances = await agentModel.getAgentBalances(agentId);
    res.status(200).json(balances);
  } catch (error) {
    console.error('Erreur lors de la récupération des soldes :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mettre à jour la balance d’un agent
const updateAgentBalance = async (req, res) => {
  try {
    const { agentId, currencyId, newBalance } = req.body;

    if (!agentId || !currencyId || typeof newBalance !== 'number') {
      return res.status(400).json({ error: 'Champs invalides.' });
    }

    const updated = await agentModel.updateAgentBalance({ agentId, currencyId, newBalance });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Erreur mise à jour balance agent :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Ajouter ou mettre à jour une balance
const insertAgentBalance = async (req, res) => {
  try {
    const { agentId, currencyId, balance } = req.body;

    if (!agentId || !currencyId || typeof balance !== 'number') {
      return res.status(400).json({ error: 'Champs invalides.' });
    }

    const result = await agentModel.insertAgentBalance({ agentId, currencyId, balance });
    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur ajout balance agent :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  createAgent,
  getAgentByEmail,
  getAgentBalances,
  updateAgentBalance,
  insertAgentBalance,
};
