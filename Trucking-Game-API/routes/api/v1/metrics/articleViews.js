const router = require('express').Router();
const {
	createArticleView,
	getTopViewedArticlesForCustomRange,
	getTopViewedArticlesForLastDay,
	getTopViewedArticlesForLastMonth,
	getTopViewedArticlesForLastWeek,
} = require('../../../../controllers/metrics/articleViewMetrics.controller');
const userRecentlyViewedArticle = require('../../../../middleware/userRecentlyViewedArticle');
const { protect } = require('../../../../middleware/auth');

/**
 * @method GET /api/v1/metrics/articleViews/customRange
 * @query startDate - start date of the custom range as YYYY-MM-DD
 * @query endDate - end date of the custom range as YYYY-MM-DD
 * @description Get top 3 articles with the most views within a user defined date range
 * @access Public | Auth | Admin
 */
router.get('/customRange', protect, getTopViewedArticlesForCustomRange);

/**
 * @method GET /api/v1/metrics/articleViews/lastDay
 * @description Get top 3 articles with the most views within the last day
 * @access Public | Auth | Admin
 */
router.get('/lastDay', protect, getTopViewedArticlesForLastDay);

/**
 * @method GET /api/v1/metrics/articleViews/lastWeek
 * @description Get top 3 articles with the most views within the last week
 * @access Public | Auth | Admin
 */
router.get('/lastWeek', protect, getTopViewedArticlesForLastWeek);

/**
 * @method GET /api/v1/metrics/articleViews/lastMonth
 * @description Get top 3 articles with the most views within the last month
 * @access Public | Auth | Admin
 */
router.get('/lastMonth', protect, getTopViewedArticlesForLastMonth);

/**
 * @method POST /api/v1/metrics/articleViews
 * @description Log the view of an article
 * @access Public | Auth | NotViewedRecently
 */
router.post('/', protect, userRecentlyViewedArticle, createArticleView);

module.exports = router;
