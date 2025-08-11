const pool = require("../config/db");

// Créer une transaction avec attribution du numéro autorisé
async function createTransaction(data) {
  const {
    from_country_id,
    to_country_id,
    sender_phone,
    receiver_phone,
    sender_method_id,
    receiver_method_id,
    send_amount,
    receive_amount,
    rate_applied,
    commission_applied
  } = data;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Trouver un numéro autorisé correspondant
    const numRes = await client.query(
      `SELECT id, number, agent_id 
       FROM authorized_numbers
       WHERE country_id = $1 
       AND payment_method_id = $2
       AND is_active = true
       LIMIT 1`,
      [from_country_id, sender_method_id]
    );

    if (numRes.rows.length === 0) {
      throw new Error("Aucun numéro autorisé disponible pour ce pays et ce moyen de paiement");
    }

    const authorized_number_id = numRes.rows[0].id;
    const assigned_agent_id = numRes.rows[0].agent_id;

    // Insérer la transaction avec le tracking_code généré par la DB
    const insertRes = await client.query(
      `INSERT INTO transactions (
        tracking_code,
        from_country_id,
        to_country_id,
        sender_phone,
        receiver_phone,
        sender_method_id,
        receiver_method_id,
        send_amount,
        receive_amount,
        rate_applied,
        commission_applied,
        assigned_agent_id,
        authorized_number_id,
        expires_at
      ) VALUES (
        generate_tracking_code(),
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
        NOW() + INTERVAL '10 minutes'
      )
      RETURNING *`,
      [
        from_country_id,
        to_country_id,
        sender_phone,
        receiver_phone,
        sender_method_id,
        receiver_method_id,
        send_amount,
        receive_amount,
        rate_applied,
        commission_applied,
        assigned_agent_id,
        authorized_number_id
      ]
    );

    await client.query("COMMIT");

    return {
      transaction: insertRes.rows[0],
      authorized_number: numRes.rows[0]
    };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createTransaction
};
