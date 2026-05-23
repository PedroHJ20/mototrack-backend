const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define as URLs e liga com as funções do controller
router.post('/signup', authController.signup);
router.post('/login', authController.login);

module.exports = router;