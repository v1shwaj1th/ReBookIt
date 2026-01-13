const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/authMiddleware');
const bodyParser = require('body-parser');

router.post('/create-payment-intent', auth, paymentController.createPaymentIntent);
router.post('/confirm-payment', auth, paymentController.confirmPayment);
router.get('/history', auth, paymentController.getTransactionHistory);

// Webhook needs raw body. standard express.json() might parse it already.
// Usually we need express.raw({type: 'application/json'}) for webhook path.
// For simplicity in this stack, assuming a separate parser or specialized setup.
// Here I'll just adding the route.
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.stripeWebhook);

module.exports = router;
