const authorizedNumberModel = require('../models/authorizedNumberModel');

// Créer un numéro autorisé
const createAuthorizedNumber = async (req, res) => {
  try {
    const { number, countryId, agentId } = req.body;

    if (!number || !countryId || !agentId) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const created = await authorizedNumberModel.createAuthorizedNumber({ number, countryId, agentId });
    res.status(201).json(created);
  } catch (error) {
    console.error('Erreur création numéro autorisé :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Obtenir un numéro autorisé par pays
const getAuthorizedNumberByCountry = async (req, res) => {
  try {
    const { countryId } = req.params;

    const number = await authorizedNumberModel.getAuthorizedNumberByCountry(countryId);
    if (!number) {
      return res.status(404).json({ error: 'Aucun numéro trouvé pour ce pays.' });
    }

    res.status(200).json(number);
  } catch (error) {
    console.error('Erreur récupération numéro autorisé :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mettre à jour un numéro autorisé
const updateAuthorizedNumber = async (req, res) => {
  try {
    const { id, number, agentId } = req.body;

    if (!id || !number || !agentId) {
      return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    const updated = await authorizedNumberModel.updateAuthorizedNumber({ id, number, agentId });
    res.status(200).json(updated);
  } catch (error) {
    console.error('Erreur mise à jour numéro autorisé :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Supprimer un numéro autorisé
const deleteAuthorizedNumber = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await authorizedNumberModel.deleteAuthorizedNumber(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Numéro non trouvé ou déjà supprimé.' });
    }

    res.status(200).json(deleted);
  } catch (error) {
    console.error('Erreur suppression numéro autorisé :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  createAuthorizedNumber,
  getAuthorizedNumberByCountry,
  updateAuthorizedNumber,
  deleteAuthorizedNumber,
};
