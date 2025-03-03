// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:macid/info', userController.getUserInfo); // Agora busca por macid
router.get('/:uid', userController.getUserById); // Caso deseje também buscar por macid
router.put('/:uid', userController.updateUser);
router.delete('/:uid', userController.deleteUser);// Agora busca por macid

module.exports = router;
