const { Request, Response, NextFunction } = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const TicketMessage = require('../models/TicketMessage');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @description Get a single ticket
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getOneTicketById = async (req, res, next) => {
	const { ticketId } = req.params;

	const ticket = await Ticket.findById(ticketId);

	if (ticket) {
		res.status(200).json({
			success: true,
			ticket,
		});
	} else {
		res.status(400).json({
			success: false,
			message: `Ticket with id ${ticketId} does not exist`,
		});
	}
};

exports.getOneTicketById = asyncHandler(_getOneTicketById);

/**
 * @description Get all tickets that are incomplete
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getIncompleteTickets = async (req, res, next) => {
	const { start, limit } = req;

	const tickets = await Ticket.find({ status: { $lt: 4 } })
		.sort({ createdAt: 'desc' })
		.skip(start)
		.limit(limit);

	const totalDocuments = await Ticket.find({ status: { $lt: 4 } }).countDocuments();

	res.status(200).json({
		success: true,
		tickets,
		totalDocuments,
	});
};

exports.getIncompleteTickets = asyncHandler(_getIncompleteTickets);

/**
 * @description Get all tickets that are completed
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getCompletedTickets = async (req, res, next) => {
	const { start, limit } = req;

	const tickets = await Ticket.find({ status: 4 })
		.sort({ createdAt: 'desc' })
		.skip(start)
		.limit(limit);
	const totalDocuments = await Ticket.find({ status: 4 }).countDocuments();

	res.status(200).json({
		success: true,
		tickets,
		totalDocuments,
	});
};

exports.getCompletedTickets = asyncHandler(_getCompletedTickets);

/**
 * @description Get all tickets that are unassigned
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getUnassignedTickets = async (req, res, next) => {
	const { start, limit } = req;

	const tickets = await Ticket.find({ assignedTo: { $exists: false } })
		.sort({ createdAt: 'desc' })
		.skip(start)
		.limit(limit);

	const totalDocuments = await Ticket.find({ assignedTo: { $exists: false } }).countDocuments();

	res.status(200).json({
		success: true,
		tickets,
		totalDocuments,
	});
};

exports.getUnassignedTickets = asyncHandler(_getUnassignedTickets);

/**
 * @description Get all tickets for a specific logged in user
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getTicketsByUser = async (req, res, next) => {
	const { email } = req.user;

	const tickets = await Ticket.find({ createdBy: email }).sort({ createdAt: 'desc' });


	res.status(200).json({
		success: true,
		tickets,
	});
};

exports.getTicketsByUser = asyncHandler(_getTicketsByUser);

/**
 * @description Get all tickets created by a single user
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getTicketsByCreator = async (req, res, next) => {
	const { email } = req.params;
	const { limit, start } = req;

	const tickets = await Ticket.find({ createdBy: email })
		.sort({ createdAt: 'desc' })
		.skip(start)
		.limit(limit);

	const totalDocuments = await Ticket.find({ createdBy: email }).countDocuments();

	res.status(200).json({
		success: true,
		tickets,
		totalDocuments,
	});
};

exports.getTicketsByCreator = asyncHandler(_getTicketsByCreator);

/**
 * @description Get all tickets assigned to an admin
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getTicketsByAssignee = async (req, res, next) => {
	const { adminEmail } = req.params;
	const { limit, start } = req;

	const user = await User.findOne({ email: adminEmail });
	let userId;
	if (user) {
		userId = user._id;
	} else {
		return next(new ErrorResponse(`User with email ${adminEmail} was not found`));
	}

	const tickets = await Ticket.find({ assignedTo: userId })
		.sort({ createdAt: 'desc' })
		.skip(start)
		.limit(limit);

	const totalDocuments = await Ticket.find({ assignedTo: userId }).countDocuments();

	res.status(200).json({
		success: true,
		tickets,
		totalDocuments,
	});
};

exports.getTicketsByAssignee = asyncHandler(_getTicketsByAssignee);

/**
 * @description Get all comments pertaining to a single ticket
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getCommentsByTicket = async (req, res, next) => {
	const { ticketId } = req.params;

	const comments = await TicketMessage.find({ relatedTicket: ticketId }).sort({ createdAt: 'asc' });
	const totalComments = await TicketMessage.find({ relatedTicket: ticketId }).countDocuments();

	res.status(200).json({
		success: true,
		comments,
		totalComments,
	});
};

exports.getCommentsByTicket = asyncHandler(_getCommentsByTicket);

/**
 * @description Create a new ticket
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _createTicket = async (req, res, next) => {
	const { message, email, category } = req.body;

	if (!message || !email || !category) {
		next(new ErrorResponse('All fields are required', 400));
	}

	const ticketCount = await Ticket.estimatedDocumentCount();

	const newTicket = await Ticket.create({
		ticketNumber: ticketCount + 1,
		message,
		createdBy: email,
		category,
	});

	res.status(200).json({
		success: true,
		ticket: newTicket,
	});
};

exports.createTicket = asyncHandler(_createTicket);

/**
 * @description Create a message on an existing ticket
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _createTicketMessage = async (req, res, next) => {
	const { id } = req.user;
	const { text } = req.body;
	const { ticketId } = req.params;

	if (!text) {
		next(new ErrorResponse('Text field is required', 400));
	}

	const validTicket = await Ticket.findById(ticketId);

	if (validTicket) {
		const newTicketMessage = await TicketMessage.create({
			text,
			relatedTicket: ticketId,
			user: id,
		});

		await validTicket.updateOne({
			$set: {
				comments: [...validTicket.comments, newTicketMessage._id],
			},
		});

		res.status(201).json({
			success: true,
			comment: newTicketMessage,
		});
	} else {
		next(new ErrorResponse(`Ticket with id ${ticketId} does not exist`, 400));
	}
};

exports.createTicketMessage = asyncHandler(_createTicketMessage);

/**
 * @description Assign a ticket to an admin
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _assignTicketToAdmin = async (req, res, next) => {
	const { ticketId, adminEmail } = req.query;

	if (!ticketId || !adminEmail) {
		next(new ErrorResponse('Ticket id and user id parameters are required', 400));
	}

	const validUser = await User.findOne({ email: adminEmail });

	if (validUser) {
		if (validUser.role >= 3) {
			const updatedTicket = await Ticket.findByIdAndUpdate(
				ticketId,
				{
					$set: {
						assignedTo: validUser._id,
					},
				},
				{ new: true }
			);

			if (updatedTicket) {
				res.status(200).json({
					success: true,
					updatedTicket,
				});
			} else {
				next(new ErrorResponse(`Ticket with id ${ticketId} does not exist`, 400));
			}
		} else {
			next(new ErrorResponse(`User with id ${userId} is not an admin`, 400));
		}
	} else {
		next(new ErrorResponse(`User with id ${userId} does not exist`, 400));
	}
};

exports.assignTicketToAdmin = asyncHandler(_assignTicketToAdmin);

/**
 * @description Update the status of a single ticket
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _updateTicketStatus = async (req, res, next) => {
	const { ticketId } = req.params;
	const { status } = req.body;

	if (!status) {
		next(new ErrorResponse('Status field is required', 400));
	}

	if (status < 0 || status > 3) {
		next(new ErrorResponse(`${status} is not a valid ticket satus`, 400));
	}

	const updatedTicket = await Ticket.findByIdAndUpdate(
		ticketId,
		{
			$set: {
				status: status,
			},
		},
		{ new: true }
	);

	if (updatedTicket) {
		res.status(200).json({
			success: true,
			updatedTicket,
		});
	} else {
		next(new ErrorResponse(`Ticket with id ${ticketId} does not exist`, 400));
	}
};

exports.updateTicketStatus = asyncHandler(_updateTicketStatus);

/**
 * @description Delete a single ticket
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _deleteOneTicket = async (req, res, next) => {
	const { ticketId } = req.params;

	const validTicket = await Ticket.findById(ticketId);

	if (validTicket) {
		await validTicket.remove();

		res.status(200).json({
			success: true,
			message: 'Successfully deleted ticket',
		});
	} else {
		next(new ErrorResponse(`Ticket with id ${ticketId} does not exist`, 400));
	}
};

exports.deleteOneTicket = asyncHandler(_deleteOneTicket);

/**
 * @description Delete multiple tickets
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _deleteMultipleTickets = async (req, res, next) => {
	const { ticketId } = req.query;

	if (!ticketId) {
		next(new ErrorResponse('TicketId parameter is required', 400));
	}

	let incompleteIds = [...ticketId];

	for (let i = 0; i < ticketId.length; i++) {
		let validTicket = await Ticket.findById(ticketId[i]);

		if (validTicket) {
			await validTicket.remove();
			incompleteIds.shift();
			continue;
		} else {
			break;
		}
	}

	if (incompleteIds.length > 0) {
		res.status(400).json({
			success: false,
			message: 'Failed to delete one or more tickets',
			incompleteIds,
		});
	} else {
		res.status(200).json({
			success: true,
			message: 'Successfully deleted tickets',
		});
	}
};

exports.deleteMultipleTickets = asyncHandler(_deleteMultipleTickets);
