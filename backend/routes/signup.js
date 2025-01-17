const express = require('express');

const signupController = require('../controllers/signup');

const router = express.Router();

router.post('/', signupController.createUser);

module.exports = router;