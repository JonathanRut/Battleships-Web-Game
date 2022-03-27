const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth')

// On post requests for /login and /signup the functions it /controllers/auth are used
// These validate submitted forms from users
router.post('/login',authController.login)
router.post('/signup', authController.signup);

module.exports = router;