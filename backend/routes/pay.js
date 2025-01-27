const express = require('express');

const payController = require('../controllers/pay');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware.userAuthenticate , payController.createPayment);

router.put('/', authMiddleware.userAuthenticate , payController.updatePayment);

module.exports = router;