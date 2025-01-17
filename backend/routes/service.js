const express = require('express');

const serviceController = require('../controllers/service');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware.userAuthenticate , serviceController.createService);

router.get('/', authMiddleware.userAuthenticate , serviceController.getAllServices);

router.put('/:serviceId', authMiddleware.userAuthenticate , serviceController.updateService);

module.exports = router;