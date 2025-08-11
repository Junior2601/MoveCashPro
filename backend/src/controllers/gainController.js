const GainsModel = require('../models/gainModel');

const GainsController = {
  async createGain(req, res) {
    try {
      const { transaction_id, agent_id, currency_id, gain_amount, commission_percent_applied } = req.body;

      if (!transaction_id || !agent_id || !currency_id || gain_amount === undefined || commission_percent_applied === undefined) {
        return res.status(400).json({ error: 'Champs requis manquants' });
      }

      const gain = await GainsModel.createGain({ transaction_id, agent_id, currency_id, gain_amount, commission_percent_applied });
      res.status(201).json({ gain });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur lors de la création du gain' });
    }
  },

  async getGainsByAgent(req, res) {
    try {
    const { agentId } = req.params;

    // Si l'utilisateur est agent, il ne peut voir que ses propres gains
    if (req.user.role === 'agent' && req.user.id !== parseInt(agentId)) {
      return res.status(403).json({ message: 'Accès interdit à ces données.' });
    }

    const gains = await GainModel.getGainsByAgentId(agentId);
    res.status(200).json(gains);

    } catch (error) {
      console.error('Erreur getGainsByAgent:', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }
};

module.exports = GainsController;
