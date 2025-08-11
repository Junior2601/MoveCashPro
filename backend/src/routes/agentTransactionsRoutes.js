// routes/agentTransactions.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateAgent = require("../middlewares/agentAuthMiddleware");

// Validation d'une transaction par un agent
router.patch("/:id/valider", authenticateAgent, async (req, res) => {
  const agentId = req.agent.id; // ID récupéré via token de l'agent
  const { id } = req.params;

  try {
    // Vérifier que la transaction existe et appartient à l'agent
    const check = await pool.query(
      `SELECT id, status 
       FROM transactions 
       WHERE id = $1 AND assigned_agent_id = $2`,
      [id, agentId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Transaction introuvable ou non assignée à cet agent" });
    }

    if (check.rows[0].status !== "en_attente") {
      return res.status(400).json({ error: "Transaction déjà traitée ou expirée" });
    }

    // Mettre à jour le statut
    const update = await pool.query(
      `UPDATE transactions
       SET status = 'effectuee',
           completed_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      message: "Transaction validée avec succès",
      transaction: update.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur lors de la validation" });
  }
});

// Marquer une transaction comme échouée
router.patch("/:id/echouer", authenticateAgent, async (req, res) => {
  const agentId = req.agent.id; // ID de l'agent connecté
  const { id } = req.params;

  try {
    // Vérifier que la transaction existe et appartient à l'agent
    const check = await pool.query(
      `SELECT id, status 
       FROM transactions 
       WHERE id = $1 AND assigned_agent_id = $2`,
      [id, agentId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Transaction introuvable ou non assignée à cet agent" });
    }

    if (check.rows[0].status !== "en_attente") {
      return res.status(400).json({ error: "Impossible de marquer cette transaction, elle est déjà traitée" });
    }

    // Mettre à jour le statut
    const update = await pool.query(
      `UPDATE transactions
       SET status = 'echouee',
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      message: "Transaction marquée comme échouée avec succès",
      transaction: update.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur lors du changement de statut" });
  }
});

// Récupérer toutes les transactions en attente assignées à l'agent
router.get("/en-attente", authenticateAgent, async (req, res) => {
  const agentId = req.agent.id; // supposons que authenticateAgent ajoute l'id agent dans req.agent

  try {
    const result = await pool.query(
      `SELECT * FROM transactions
       WHERE assigned_agent_id = $1
         AND status = 'en_attente'
       ORDER BY created_at DESC`,
      [agentId]
    );

    res.json({
      transactions: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
