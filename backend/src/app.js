// app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
// const transactionRoutes = require('./routes/transactionRoutes.js');
const agentRoutes = require('./routes/agentRoutes.js');
// const gainRoutes = require('./routes/gainRoutes.js');
// const balanceRoutes = require('./routes/balanceRoutes.js');
// const historyRoutes = require('./routes/historyRoutes');
// const redirectionRoutes = require('./routes/redirectionRoutes.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
// app.use('/api/transactions', transactionRoutes);
app.use('/api/agents', agentRoutes);
// app.use('/api/gains', gainRoutes);
// app.use('/api/balances', balanceRoutes);
// app.use('/api/history', historyRoutes);
// app.use('/api/redirections', redirectionRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Plateforme de Transfert – API en ligne');
});

module.exports = app;
