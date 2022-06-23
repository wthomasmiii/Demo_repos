const moment = require('moment');
const mongoose = require('mongoose');
const { getDateString } = require('../utils/dateHelper');

const SaleSchema = new mongoose.Schema({
	stripeSessionId: {
		type: String,
		required: [true, 'Please include the Stripe Session Id'],
	},
	subtotal: {
		type: Number,
		required: [true, 'Please include the subtotal for this sale'],
	},
	total: {
		type: Number,
		required: [true, 'Please include the total for this sale'],
	},
	customerEmail: {
		type: String,
		required: [true, 'Please include a customer email for this sale'],
		unique: [true, 'Customer Email must be unique'],
	},
	paymentStatus: {
		type: String,
		required: [true, 'Please include a payment status for this sale'],
		enum: ['paid', 'unpaid', 'no_payment_required'],
	},
	createdAt: {
		type: Date,
		default: function () {
			return new Date();
		},
	},
});

SaleSchema.set('toJSON', {
	transform: (doc, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		returnedObject.createdAt = getDateString(doc.createdAt);

		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

SaleSchema.statics.getSalesForLastFiveMinutes = async function () {
	try {
		const now = moment();
		const fiveMinutesAgo = now.subtract(5, 'm');

		const sales = await this.where('createdAt').gte(fiveMinutesAgo).lte(now);

		return sales;
	} catch (error) {
		console.log(error);
		return false;
	}
};

module.exports = mongoose.model('Sale', SaleSchema);
