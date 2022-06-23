const mongoose = require('mongoose');
const Ticket = require('./Ticket');
const { getRelativeDateString, getDateString } = require('../utils/dateHelper');

const TicketMessageSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true,
	},
	relatedTicket: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Ticket',
		required: true,
		autopopulate: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		autopopulate: true,
	},
	createdAt: {
		type: Date,
		default: function () {
			return new Date();
		},
	},
});

TicketMessageSchema.plugin(require('mongoose-autopopulate'));

/** Remove the ticketMessage from it's related ticket's array of comments after removal */
TicketMessageSchema.post('remove', async function (doc, next) {
	try {
		const ticket = await Ticket.findById(this.relatedTicket);
		ticket.comments.pull(this.relatedTicket);
		await ticket.save();
		next();
	} catch (error) {
		next(error);
	}
});

/** Add the ticketMessage to the related ticket's array of comments */
TicketMessageSchema.post('save', async function (doc, next) {
	try {
		const ticket = await Ticket.findById(this.relatedTicket);
		ticket.comments.push(this._id);
		await ticket.save();
		next();
	} catch (error) {
		next(error);
	}
});

TicketMessageSchema.set('toJSON', {
	transform: (doc, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		returnedObject.createdAt = getDateString(doc.createdAt);
		returnedObject.relativeTime = getRelativeDateString(doc.createdAt);

		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

const TicketMessage = mongoose.model('TicketMessage', TicketMessageSchema);

module.exports = TicketMessage;
