// middlewares/authenticateAdminOrAgent.js
const authenticateAdmin = require('./authMiddleware');
const authenticateAgent = require('./agentAuthMiddleware');

module.exports = (req, res, next) => {
  // Essayer de valider en tant qu'admin
  authenticateAdmin(req, res, (err) => {
    if (!err && req.user?.role === 'admin') {
      return next(); // Admin validé
    }

    // Sinon, essayer de valider en tant qu'agent
    authenticateAgent(req, res, (err) => {
      if (!err && req.user?.role === 'agent') {
        return next(); // Agent validé
      }

      return res.status(403).json({ message: 'Accès interdit.' });
    });
  });
};
