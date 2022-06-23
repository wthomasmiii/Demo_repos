const { Request, Response, NextFunction } = require('express');
const ArticleView = require('../models/ArticleView');
const { subHours, compareAsc, parse } = require('date-fns');

/**
 * @description Checks if we have already recorded an article view for a specific user within the last 24 hours.
 * If one has been recorded then we send an appropriate response to the client and do not record the view.
 * If one has not been recorded then we move on to the next function in the stack which will record the view in the database.
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const userRecentlyViewedArticle = async (req, res, next) => {
	const { id } = req.user;

	try {
		const now = new Date();
		const cutoff = subHours(
			now,
			24
		); /** This cutoff time can be replaced with any amount of time that we want to limit recorded views to */

		// Find the most recent log of a view with the given user id
		const mostRecentLog = await ArticleView.find({ user: id }).sort('-timestamp')[0];

		const mostRecentLogDate = parse(mostRecentLog.timestamp);

		/**
		 * 1date-fns.compareAsc
		 *
		 * Returns:
		 * - 1 if date1 is after date2
		 * - 0 if the two dates are equal
		 * - -1 if date 1 is before date2
		 */
		// Compare the date on that log to now
		// If within the last `x` amount of time return 204
		const compareResults = compareAsc(mostRecentLogDate, cutoff);

		if (compareResults === 1 || compareResults === 0) {
			res.status(204).json({
				success: false,
				message:
					'User viewed this article less than 24 hours ago so this view is not being recorded',
			});
		} else {
			next();
		}
	} catch (error) {
		next(error);
	}
};

module.exports = userRecentlyViewedArticle;
