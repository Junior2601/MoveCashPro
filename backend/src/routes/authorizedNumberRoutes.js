const express = require('express');
const router = express.Router();
const authorizedNumberController = require('../controllers/authorizedNumberController');

// Créer un numéro autorisé
router.post('/', authorizedNumberController.createAuthorizedNumber);

// Obtenir un numéro autorisé par pays
router.get('/country/:countryId', authorizedNumberController.getAuthorizedNumberByCountry);

// Mettre à jour un numéro autorisé
router.put('/', authorizedNumberController.updateAuthorizedNumber);

// Supprimer un numéro autorisé
router.delete('/:id', authorizedNumberController.deleteAuthorizedNumber);

module.exports = router;
