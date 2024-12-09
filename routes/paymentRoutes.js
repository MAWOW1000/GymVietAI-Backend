const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

router.get('/plans', paymentController.getSubscriptionPlans);
router.post('/create', verifyToken, paymentController.createPayment);
router.get('/vnpay_return', paymentController.handleVNPayReturn);
router.post('/vnpay_ipn', paymentController.handleVNPayIPN);

module.exports = router; 