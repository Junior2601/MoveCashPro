const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findAdminByEmail, createAdmin } = require('../models/adminModel');
const generateToken = require('../utils/generateToken');

// @desc    Login admin
// @route   POST /api/admin/login
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // try {
    const admin = await findAdminByEmail(email); 
    console.log("+++++++++++++++++++++++++++++++++++++++++")
    console.log(admin);

    if (!admin) {
      return res.status(404).json({ message: 'Admin non trouvé' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe invalide' });
    }

    const token = generateToken(admin.id);
    res.status(200).json({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      token,
    });
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).json({ message: 'Erreur serveur' });
  // }
};

// @desc    Inscription admin (manuel)
// @route   POST /api/admin/register
exports.registerAdmin = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existing = await findAdminByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await createAdmin({ email, password: hashedPassword, name });

    const token = generateToken(newAdmin.id);
    res.status(201).json({
      id: newAdmin.id,
      email: newAdmin.email,
      name: newAdmin.name,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.test = async( req, res) => {
 res.send('test');
};
