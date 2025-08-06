const db = require('../config/db');

// créer une transaction
const createTransaction = async (data) => {
  const {
    trackingCode,
    senderCountryId,
    receiverCountryId,
    senderPhone,
    receiverPhone,
    paymentMethod,
    receptionMethod,
    amountSent,
    amountReceived,
    exchangeRate,
    commissionPercent,
    agentGain,
    companyMargin,
    agentId,
    authorizedNumberId,
    status
  } = data;

  const result = await db.query(
    `INSERT INTO transactions (
      tracking_code, sender_country_id, receiver_country_id,
      sender_phone, receiver_phone, payment_method, reception_method,
      amount_sent, amount_received, exchange_rate, commission_percent,
      agent_gain, company_margin, agent_id, authorized_number_id, status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13, $14, $15, $16
    ) RETURNING *`,
    [
      trackingCode, senderCountryId, receiverCountryId,
      senderPhone, receiverPhone, paymentMethod, receptionMethod,
      amountSent, amountReceived, exchangeRate, commissionPercent,
      agentGain, companyMargin, agentId, authorizedNumberId, status
    ]
  );
  return result.rows[0];
};

// obtenir une transaction
const getTransactionByTrackingCode = async (code) => {
  const result = await db.query(
    `SELECT * FROM transactions WHERE tracking_code = $1`,
    [code]
  );
  return result.rows[0];
};

module.exports = {
  createTransaction,
  getTransactionByTrackingCode,
};
