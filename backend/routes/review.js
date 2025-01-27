const express = require('express');

const reviewController = require('../controllers/review');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware.userAuthenticate , reviewController.createReview);

router.get('/', authMiddleware.userAuthenticate , reviewController.getAllReviews);

module.exports = router;