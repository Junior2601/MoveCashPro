const adminModel = require('../models/adminModel');

// Créer un nouvel administrateur
const createAdmin = async (req, res) => {
  try {
    const { name, email, passwordHash } = req.body;

    if (!name || !email || !passwordHash) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const existingAdmin = await adminModel.getAdminByEmail(email);
    if (existingAdmin) {
      return res.status(409).json({ error: 'Un admin avec cet email existe déjà.' });
    }

    const newAdmin = await adminModel.createAdmin({ name, email, passwordHash });
    res.status(201).json(newAdmin);
  } catch (error) {
    console.error('Erreur lors de la création de l’admin :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Obtenir un admin par email
const getAdminByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const admin = await adminModel.getAdminByEmail(email);
    if (!admin) {
      return res.status(404).json({ error: 'Admin non trouvé' });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error('Erreur lors de la récupération de l’admin :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  createAdmin,
  getAdminByEmail,
};
