const jwt = require('jsonwebtoken');

const protectAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide' });
  }
};

module.exports = protectAdmin;
