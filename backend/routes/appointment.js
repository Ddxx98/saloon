const express = require('express');

const appointmentController = require('../controllers/appointment');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware.userAuthenticate , appointmentController.createAppointment);

router.get('/', authMiddleware.userAuthenticate , appointmentController.getAllAppointments);

router.get('/user/:userId', authMiddleware.userAuthenticate , appointmentController.getAppointmentsByUserId);

router.get('/staff/:staffId', authMiddleware.userAuthenticate , appointmentController.getAppointmentsByStaffId);

module.exports = router;