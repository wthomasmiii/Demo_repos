const router = require('express').Router();
const {
	getIncompleteTickets,
	assignTicketToAdmin,
	createTicket,
	createTicketMessage,
	deleteMultipleTickets,
	deleteOneTicket,
	getOneTicketById,
	getTicketsByAssignee,
	getTicketsByCreator,
	getUnassignedTickets,
	updateTicketStatus,
	getCommentsByTicket,
	getCompletedTickets,
	getTicketsByUser,
} = require('../../../controllers/tickets.controller');
const pagination = require('../../../middleware/pagination');
const { protect } = require('../../../middleware/auth');

/**
 * @method GET /api/v1/tickets/incomplete
 * @description Get all tickets that are incomplete
 * @access Public | Auth | Admin
 */
router.get('/incomplete', protect, pagination, getIncompleteTickets);

/**
 * @method GET /api/v1/tickets/completed
 * @description Get all tickets that are completed
 * @access Public | Auth | Admin
 */
router.get('/completed', protect, pagination, getCompletedTickets);

/**
 * @method GET /api/v1/tickets/unassigned
 * @description Get all tickets that are unassigned
 * @access Public | Auth | Admin
 */
router.get('/unassigned', protect, pagination, getUnassignedTickets);

/**
 * @method GET /api/v1/tickets/mine
 * @description Get all tickets for a specific logged in user
 * @access Public | Auth
 */
router.get('/mine', protect, getTicketsByUser);

/**
 * @method GET /api/v1/tickets/:ticketId
 * @description Get a single ticket
 * @access Public | Auth
 */
router.get('/:ticketId', protect, getOneTicketById);

/**
 * @method GET /api/v1/tickets/byUser
 * @description Get all tickets created by a single user
 * @access Public | Auth
 */
router.get('/byUser/:email', protect, pagination, getTicketsByCreator);

/**
 * @method GET /api/v1/tickets/byAssignee/:userId
 * @description Get all tickets assigned to a single user
 * @access Public | Auth | Admin
 */
router.get('/byAssignee/:adminEmail', protect, pagination, getTicketsByAssignee);

/**
 * @method GET /api/v1/tickets/:ticketId/comments
 * @description Get all comments pertaining to a single ticket
 * @access Public | Auth
 */
router.get('/:ticketId/comments', protect, getCommentsByTicket);

/**
 * @method POST /api/v1/tickets
 * @description Create a new ticket
 * @access Public
 */
router.post('/', createTicket);

/**
 * @method POST /api/v1/tickets/:id/message
 * @description Create a message on an existing ticket
 * @access Public | Auth
 */
router.post('/:ticketId/message', protect, createTicketMessage);

/**
 * @method PATCH /api/v1/tickets/assignUser?ticketId=<string>&userId=<string>
 * @description Assign a ticket to an admin
 * @access Public | Auth | Admin
 */
router.patch('/assignUser', protect, assignTicketToAdmin);

/**
 * @method PATCH /api/v1/tickets/updateStatus/:ticketId
 * @description Update the status of a single ticket
 * @access Public | Auth | Admin
 */
router.patch('/updateStatus/:ticketId', protect, updateTicketStatus);

/**
 * @method DELETE /api/v1/tickets/multiple?id=[string]
 * @description Delete multiple tickets
 * @access Public | Auth | Admin
 */
router.delete('/multiple', protect, deleteMultipleTickets);

/**
 * @method DELETE /api/v1/tickets/:id
 * @description Delete a single ticket
 * @access Public | Auth | Admin
 */
router.delete('/:ticketId', protect, deleteOneTicket);

module.exports = router;
