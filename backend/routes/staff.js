const express = require('express');

const staffController = require('../controllers/staff');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware.userAuthenticate , staffController.createStaff);

router.put('/', authMiddleware.userAuthenticate , staffController.updateStaff);

router.get('/staff', authMiddleware.userAuthenticate , staffController.getStaffs);

router.get('/', authMiddleware.userAuthenticate , staffController.getAllStaffs);

module.exports = router;