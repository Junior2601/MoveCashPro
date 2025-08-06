const getAgentBalance = async (client, agentId, currencyId) => {
  const result = await client.query(
    `SELECT balance FROM agent_balances WHERE agent_id = $1 AND currency_id = $2`,
    [agentId, currencyId]
  );
  return result.rows[0]?.balance ?? 0;
};

const deductAgentBalance = async (client, agentId, currencyId, amount) => {
  await client.query(
    `UPDATE agent_balances
     SET balance = balance - $1,
         updated_at = NOW()
     WHERE agent_id = $2 AND currency_id = $3`,
    [amount, agentId, currencyId]
  );
};

module.exports = {
  getAgentBalance,
  deductAgentBalance
};
