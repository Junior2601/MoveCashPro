const logTransactionHistory = async ({
  transactionId,
  previousStatus,
  newStatus,
  changedBy,
  changedByType,
  client
}) => {
  const result = await client.query(
    `INSERT INTO transaction_history (
      transaction_id,
      previous_status,
      new_status,
      changed_by,
      changed_by_type,
      changed_at
    ) VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id`,
    [transactionId, previousStatus, newStatus, changedBy, changedByType]
  );
  return result.rows[0].id;
};

module.exports = {
  logTransactionHistory
};
