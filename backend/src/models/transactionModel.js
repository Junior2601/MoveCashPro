const insertTransaction = async ({
  client,
  tracking_code,
  sender_country_id,
  receiver_country_id,
  sender_phone,
  receiver_phone,
  payment_method,
  reception_method,
  amount_sent,
  amount_received,
  exchange_rate,
  commission_percent,
  agent_gain,
  company_margin,
  agent_id,
  authorized_number_id
}) => {
  const result = await client.query(
    `INSERT INTO transactions (
      tracking_code,
      sender_country_id,
      receiver_country_id,
      sender_phone,
      receiver_phone,
      payment_method,
      reception_method,
      amount_sent,
      amount_received,
      exchange_rate,
      commission_percent,
      agent_gain,
      company_margin,
      agent_id,
      authorized_number_id,
      status,
      created_at,
      updated_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'en_attente', NOW(), NOW()
    ) RETURNING id`,
    [
      tracking_code,
      sender_country_id,
      receiver_country_id,
      sender_phone,
      receiver_phone,
      payment_method,
      reception_method,
      amount_sent,
      amount_received,
      exchange_rate,
      commission_percent,
      agent_gain,
      company_margin,
      agent_id,
      authorized_number_id
    ]
  );
  return result.rows[0].id;
};

module.exports = { insertTransaction };
