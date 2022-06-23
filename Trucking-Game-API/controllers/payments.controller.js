const { Request, Response, NextFunction } = require('express');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const Sale = require('../models/Sale');
const moment = require('moment');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @description Get total sales figure for a specific time frame
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getSales = async (req, res, next) => {
	let totalSales = 0;
	const now = moment();
	const fiveMinutesAgo = now.subtract(5, 'm');

	// ! THIS IS COMMENTED OUT FOR DEV PURPOSES
	// const sales = await Sale.find({ createdAt: { $lte: now, $gte: fiveMinutesAgo } });

	// if (sales.length > 0) {
	// 	totalSales = sales.reduce((prev, cur) => prev + cur.total, 0);
	// }

	res.status(200).json({
		success: true,
		label: now.format('HH:mm'),
		data: Math.ceil(Math.random() * 5000),
	});
};

exports.getSales = asyncHandler(_getSales);

/**
 * @description Create checkout session with Stripe API
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _createCheckoutSession = async (req, res, next) => {
	const { id } = req.user;
	const { successUrl, cancelUrl } = req.body;

	const user = await User.findById(id);

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		line_items: [
			{
				price_data: {
					currency: 'usd',
					product_data: {
						name: 'Premium account upgrade',
					},
					unit_amount: 1099,
				},
				quantity: 1,
			},
		],
		customer_email: user.email,
		mode: 'payment',
		success_url: `http://${req.hostname}:3000${successUrl}`, //! UPDATE FOR PRODUCTION
		cancel_url: `http://${req.hostname}:3000${cancelUrl}`, //! UPDATE FOR PRODUCTION
	});

	res.status(200).json({
		success: true,
		id: session.id,
	});
};

exports.createCheckoutSession = asyncHandler(_createCheckoutSession);

/**
 * @description Handle webhook events sent from the Stripe API
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _handleWebhook = async (req, res, next) => {
	const event = req.webhookEvent;

	// Handle webhooks
	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object;

			_fulfillOrder(session);
			break;
		}
		default:
			console.log(`UnhandledWebhook: ${event.type}`);
	}

	res.status(200).json({ success: true });
};

exports.handleWebhook = asyncHandler(_handleWebhook);

/**
 *
 * @param {any} session Stripe Session object
 */
const _fulfillOrder = async session => {
	console.log(session);

	// Save relevant payment information to the database
	await Sale.create({
		stripeSessionId: session.id,
		subtotal: session.amount_subtotal,
		total: session.amount_total,
		customerEmail: session.customer_email,
		paymentStatus: session.payment_status,
	});

	// TODO: Send confirmation email to the recipient email

	// Update the user to reflect their upgraded status
	const user = await User.findOne({ email: session.customer_email });
	await user.upgradeAccount();
};
