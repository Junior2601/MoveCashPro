const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/adminRoutes');
const agentRoutes = require('./routes/agentRoutes');
const currencyRoutes = require('./routes/currencyRoutes');
const countryRoutes = require('./routes/countryRoutes');
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');
const rateRoutes = require('./routes/rateRoutes');
const authorizedNumberRoutes = require('./routes/authorizedNumberRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const agentTransactionsRoutes = require("./routes/agentTransactionsRoutes");
const gainRoutes = require('./routes/gainRoutes');
const redirectionRoutes = require('./routes/redirectionRoutes');


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/admin', adminRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/authorized-numbers', authorizedNumberRoutes);
app.use('/api/balances', balanceRoutes);

app.use('/api/transactions', transactionRoutes);

app.use("/api/agents/transactions", agentTransactionsRoutes);

app.use('/api/gains', gainRoutes);

app.use('/api/redirections', redirectionRoutes);

app.get('/', (req, res) => {
  res.send('API Transfert d’argent OK');
});

module.exports = app;
