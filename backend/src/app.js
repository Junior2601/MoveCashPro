// app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
// const transactionRoutes = require('./routes/transactionRoutes');
// const agentRoutes = require('./routes/agentRoutes');
// const gainRoutes = require('./routes/gainRoutes');
// const balanceRoutes = require('./routes/balanceRoutes');
// const historyRoutes = require('./routes/historyRoutes');
// const redirectionRoutes = require('./routes/redirectionRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
// app.use('/api/transactions', transactionRoutes);
// app.use('/api/agents', agentRoutes);
// app.use('/api/gains', gainRoutes);
// app.use('/api/balances', balanceRoutes);
// app.use('/api/history', historyRoutes);
// app.use('/api/redirections', redirectionRoutes);

// Route principale
app.get('/', (req, res) => {
  res.send('🚀 Plateforme de Transfert – API en ligne');
});

// Endpoint pour l'heure du serveur
app.get('/api/server-time', (req, res) => {
  const now = new Date();
  
  res.json({
    timestamp: now.getTime(),
    isoString: now.toISOString(),
    localString: now.toLocaleString('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    utcString: now.toUTCString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    serverUptime: process.uptime()
  });
});

// Endpoint alternatif plus simple
app.get('/api/time', (req, res) => {
  res.json({
    serverTime: new Date().toISOString(),
    timestamp: Date.now()
  });
});

module.exports = app;