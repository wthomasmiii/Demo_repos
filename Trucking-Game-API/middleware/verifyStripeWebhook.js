const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const verifyStripeWebhook = (req, res, next) => {
	const payload = req.body;
	const sig = req.headers['stripe-signature'];

	let event;
	try {
		event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);

		req.webhookEvent = event;
		next();
	} catch (error) {
		next(error);
	}
};

module.exports = verifyStripeWebhook;
