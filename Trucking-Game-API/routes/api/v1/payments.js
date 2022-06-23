const express = require('express');

const router = express.Router();
const {
	createCheckoutSession,
	handleWebhook,
	getSales,
} = require('../../../controllers/payments.controller');
const verifyStripeWebhook = require('../../../middleware/verifyStripeWebhook');
const { protect } = require('../../../middleware/auth');

/**
 * @method GET /api/v1/payments/sales
 * @description Get total sales number for a specified time frame
 * @access Public | Auth | Admin
 */
router.get('/sales', protect, getSales);

/**
 * @method POST /api/v1/payments/create-checkout-session
 * @description Create checkout session with Stripe API
 * @access Public | Auth
 */
router.post('/create-checkout-session', protect, createCheckoutSession);

/**
 * @method POST /api/v1/payments/webhook
 * @description Webhook route to catch any webhook events from the Stripe API
 * @access Private | Stripe
 */
router.post(
	'/webhooks',
	express.raw({ type: 'application/json' }),
	verifyStripeWebhook,
	handleWebhook
);

module.exports = router;
