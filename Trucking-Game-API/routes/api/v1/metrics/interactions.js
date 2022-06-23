const router = require('express').Router();
const { protect, authorize } = require('../../../../middleware/auth');
const {
	getMyInteractionStatistics,
	getUserInteractionStatistics,
} = require('../../../../controllers/metrics/interactionMetrics.controller');

/**
 * @method GET /api/v1/metrics/interactions/
 * @description Get interaction statistics for a logged in user
 * @access Public | Auth | Admin
 */
router.get('/me', protect, authorize(1, 2), getMyInteractionStatistics);

/**
 * @method GET /api/v1/metrics/interactions/user/:userId
 * @description Get interaction statistics for a specific user (non-admin)
 * @access Public | Auth | Admin
 */
router.get('/:userId', protect, authorize(1, 2), getUserInteractionStatistics);

module.exports = router;
