const jwt = require('jsonwebtoken');

const agentAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'agent') {
      return res.status(403).json({ error: 'Accès réservé aux agents.' });
    }

    req.agent = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide.' });
  }
};

module.exports = agentAuthMiddleware;
