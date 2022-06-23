const router = require('express').Router();
const {
	getActiveTicketCountForCustomRange,
	getActiveTicketCountForLastDay,
	getActiveTicketCountForLastMonth,
	getActiveTicketCountForLastWeek,
} = require('../../../../controllers/metrics/ticketMetrics.controller');
const { protect } = require('../../../../middleware/auth');

/**
 * @method GET /api/v1/metrics/tickets/customRange
 * @query startDate - start date of the custom range as YYYY-MM-DD
 * @query endDate - end date of the custom range as YYYY-MM-DD
 * @description Get the count of active tickets created within a user defined range
 * @access Public | Auth | Admin
 */
router.get('/customRange', protect, getActiveTicketCountForCustomRange);

/**
 * @method GET /api/v1/metrics/tickets/lastDay
 * @description Get the count of active tickets created within the last day
 * @access Public | Auth | Admin
 */
router.get('/lastDay', protect, getActiveTicketCountForLastDay);

/**
 * @method GET /api/v1/metrics/tickets/lastWeek
 * @description Get the count of active tickets created within the last week
 * @access Public | Auth | Admin
 */
router.get('/lastWeek', protect, getActiveTicketCountForLastWeek);

/**
 * @method GET /api/v1/metrics/tickets/lastMonth
 * @description Get the count of active tickets within the last month
 * @access Public | Auth | Admin
 */
router.get('/lastMonth', protect, getActiveTicketCountForLastMonth);

module.exports = router;
