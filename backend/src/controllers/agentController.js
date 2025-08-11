const db = require('../config/db');
const bcrypt = require('bcrypt');

// Créer un agent
const createAgent = async ({ email, password, name, country_id }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO agents (email, password, name, country_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, country_id, created_at`,
    [email, hashedPassword, name, country_id]
  );
  return result.rows[0];
};

// Rechercher un agent par email
const findAgentByEmail = async (email) => {
  const result = await db.query(
    `SELECT * FROM agents WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};

// Modifier un agent
const updateAgent = async (id, { email, password, name, country_id }) => {
  const current = await db.query(`SELECT * FROM agents WHERE id = $1`, [id]);
  if (current.rowCount === 0) throw new Error('Agent non trouvé.');

  let hashedPassword = password
    ? await bcrypt.hash(password, 10)
    : current.rows[0].password;

  const result = await db.query(
    `UPDATE agents
     SET email = $1,
         password = $2,
         name = $3,
         country_id = $4
     WHERE id = $5
     RETURNING id, email, name, country_id, updated_at`,
    [email, hashedPassword, name, country_id, id]
  );

  return result.rows[0];
};

// Supprimer un agent
const deleteAgent = async (id) => {
  await db.query(`DELETE FROM agents WHERE id = $1`, [id]);
  return { message: 'Agent supprimé avec succès.' };
};

const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    const agent = await agentModel.findAgentByEmail(email);
    if (!agent) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    const isPasswordValid = await bcrypt.compare(password, agent.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    const token = jwt.sign(
      { id: agent.id, role: 'agent' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie.',
      token,
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        country_id: agent.country_id,
      }
    });
  } catch (error) {
    console.error('Erreur login agent:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};
module.exports = {
  createAgent,
  findAgentByEmail,
  updateAgent,
  deleteAgent,
  loginAgent,
};
