const express = require("express");
const router = express.Router();
const transactionsController = require("../controllers/transactionController");

// Créer une transaction et retourner le numéro autorisé
router.post("/", transactionsController.createTransaction);
router.put('/:id/validate', transactionsController.validateTransaction);
// router.put('/:id/validate', transactionsController.validateTransaction);

module.exports = router;
