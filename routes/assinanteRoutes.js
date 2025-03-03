// routes/assinanteRoutes.js
const express = require('express');
const router = express.Router();
const assinanteController = require('../controllers/assinanteController');

router.post('/', assinanteController.createAssinante);
router.get('/', assinanteController.getAssinantes);
router.get('/:id', assinanteController.getAssinanteById);
router.put('/:id', assinanteController.updateAssinante);
router.delete('/:id', assinanteController.deleteAssinante);

module.exports = router;
