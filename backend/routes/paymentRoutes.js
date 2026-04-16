const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/create-payment', auth, paymentController.createPayment);
router.post('/verify-payment', auth, paymentController.verifyPayment);
router.get('/payments/:userId', auth, paymentController.getUserPayments);

module.exports = router;