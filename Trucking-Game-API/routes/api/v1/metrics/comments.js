const router = require('express').Router();
const {
	getCommentCountForCustomRange,
	getCommentCountForLastDay,
	getCommentCountForLastMonth,
	getCommentCountForLastWeek,
} = require('../../../../controllers/metrics/commentMetrics.controller');
const { protect } = require('../../../../middleware/auth');

/**
 * @method GET /api/v1/metrics/comments/customRange
 * @query startDate - start date of the custom range as YYYY-MM-DD
 * @query endDate - end date of the custom range as YYYY-MM-DD
 * @description Get the total count of comments created within a user defined range
 * @access Public | Auth | Admin
 */
router.get('/customRange', protect, getCommentCountForCustomRange);

/**
 * @method GET /api/v1/metrics/comments/lastDay
 * @description Get the total count of comments created within the last day
 * @access Public | Auth | Admin
 */
router.get('/lastDay', protect, getCommentCountForLastDay);

/**
 * @method GET /api/v1/metrics/comments/lastWeek
 * @description Get the total count of comments created within the last week
 * @access Public | Auth | Admin
 */
router.get('/lastWeek', protect, getCommentCountForLastWeek);

/**
 * @method GET /api/v1/metrics/comments/lastMonth
 * @description Get the total count of comments created within the last month
 * @access Public | Auth | Admin
 */
router.get('/lastMonth', protect, getCommentCountForLastMonth);

module.exports = router;
