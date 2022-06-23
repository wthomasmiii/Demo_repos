const mongoose = require('mongoose');
const { getRelativeDateString, getDateString } = require('../utils/dateHelper');

const TicketSchema = new mongoose.Schema({
	ticketNumber: {
		type: String,
		unique: true,
		required: true,
	},
	message: {
		type: String,
		required: true,
	},
	status: {
		type: Number,
		enum: [0, 1, 2, 3, 4],
		default: 0,
	},
	category: {
		type: String,
		required: true,
	},
	createdBy: {
		type: String,
		required: true,
		validate: {
			validator: function (v) {
				return new RegExp(/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/).test(v);
			},
			message: props => `${props.value} is not a valid email`,
		},
	},
	assignedTo: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		autopopulate: true,
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'TicketMessage',
			autopopulate: true,
		},
	],
	createdAt: {
		type: Date,
		default: function () {
			return new Date();
		},
	},
	updatedAt: {
		type: Date,
		default: function () {
			return new Date();
		},
	},
});

TicketSchema.plugin(require('mongoose-autopopulate'));

TicketSchema.set('toJSON', {
	transform: (doc, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();

		returnedObject.createdAt = getDateString(doc.createdAt);
		returnedObject.updatedAt = getDateString(doc.updatedAt);

		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;
