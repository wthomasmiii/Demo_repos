const { Request, Response, NextFunction } = require('express');
const Article = require('../../models/Article');
const ArticleView = require('../../models/ArticleView');
const ArticleComment = require('../../models/ArticleComment');
const User = require('../../models/User');
const Ticket = require('../../models/Ticket');
const asyncHandler = require('../../middleware/async');

/**
 * @description Get interaction statistics for a logged in user
 * - Total Traffic: # of views on articles atrributed to the user
 * - Total Interactions: Total Traffic + # of comments on articles attributed to the user
 * - Number of Articles: # of articles written by the user
 * - Number of comments: # of comments written by the user
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getMyInteractionStatistics = async (req, res, next) => {
	const userId = req.user.id;

	const userArticles = await Article.find({ author: userId });
	const userArticlesCount = userArticles.length;
	const userCommentsCount = await ArticleComment.find({ user: userId }).countDocuments();

	const articleIds = userArticles.map(article => article.id);

	const totalTraffic = await ArticleView.find({ article: { $in: articleIds } }).countDocuments();
	const totalComments = await ArticleComment.find({
		relatedArticle: { $in: articleIds },
	}).countDocuments();

	res.status(200).json({
		success: true,
		totalTraffic,
		totalInteractions: totalTraffic + totalComments,
		numberOfArticles: userArticlesCount,
		numberOfComments: userCommentsCount,
	});
};

exports.getMyInteractionStatistics = asyncHandler(_getMyInteractionStatistics);

/**
 * @description Get interactions statistics for a specific user
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 *
 * If user is an admin
 * @return
 * ticketsCompleted: number;
 * ticketsAssigned: number;
 * totalTraffic: number;
 * totalInteractions: number;
 * numberOfArticles: number;
 * numberOfComments: number;
 *
 *
 * If user is non-admin
 * @returns
 * mostViewedArticles: Document[];
 * totalInteractions: number;
 * numberOfComments: number;
 *
 */
const _getUserInteractionStatistics = async (req, res, next) => {
	const { userId } = req.params;

	const user = await User.findById(userId);

	if (user && user.role < 3) {
		// Get ticket statistics
		const ticketsCompleted = await Ticket.find({
			$and: [{ assignedTo: userId }, { status: 4 }],
		}).countDocuments();
		const ticketsAssigned = await Ticket.find({ assignedTo: userId }).countDocuments();

		// Get user number of articles and comments
		const userArticles = await Article.find({ author: userId });
		const userArticlesCount = userArticles.length;
		const userCommentCount = await ArticleComment.find({ user: userId }).countDocuments();

		const articleIds = userArticles.map(article => article.id);

		// Get traffic and interactions related to user content
		const totalTraffic = await ArticleView.find({ article: { $in: articleIds } }).countDocuments();
		const totalComments = await ArticleComment.find({
			relatedArticle: { $in: articleIds },
		}).countDocuments();

		res.status(200).json({
			success: true,
			ticketsCompleted,
			ticketsAssigned,
			numberOfArticles: userArticlesCount,
			numberOfComments: userCommentCount,
			totalTraffic,
			totalInteractions: totalTraffic + totalComments,
		});
	} else if (user) {
		// Get top 3 most viewed articles
		const allArticleViews = await ArticleView.find({ user: userId });

		const viewsCount = getViewsCount(allArticleViews);
		const topSixArticleIds = getTopSixArticleIds(viewsCount);
		const topSixArticles = await getTopSixArticles(topSixArticleIds);

		// Get number of comments
		const comments = await ArticleComment.find({ user: userId }).countDocuments();

		// Get total interactions
		const numberOfArticleViews = allArticleViews.length;
		const totalInteractions = numberOfArticleViews + comments;

		// Construct Article View Objects
		let mostViewedArticles = [];
		for (let i = 0; i < topSixArticles.length; i++) {
			const currentArticle = topSixArticles[i];

			const articleObj = {
				article: currentArticle,
				views: viewsCount[currentArticle._id],
			};

			mostViewedArticles.push(articleObj);
		}

		res.status(200).json({
			success: true,
			mostViewedArticles,
			totalInteractions,
			numberOfComments: comments,
		});
	} else {
		next(new ErrorResponse(`User with id ${userId} does not exist`, 400));
	}
};

exports.getUserInteractionStatistics = asyncHandler(_getUserInteractionStatistics);

// HELPER FUNCTIONS

/**
 * @description Loop through an array of views and return the count of views for each distinct article id
 * @param {Array<mongoose.Document>} views An array of ArticleView documents
 * @returns {{[key:string]: number}} An object with an articleId as the key and count of views as the value
 */
const getViewsCount = views => {
	let viewsCount = {};

	for (let i = 0; i < views.length; i++) {
		if (viewsCount[views[i].article]) {
			viewsCount[views[i].article]++;
		} else {
			viewsCount[views[i].article] = 1;
		}
	}

	return viewsCount;
};

/**
 * @description Take a count of views for each distinct article id and return an array of the 3 ids with the most views
 * @param {{[key: string]: number}} viewsCount An object with an articleId as the key and count of views as the value
 * @returns {Array<mongoose.Schema.Types.ObjectId>} An array with the 3 articleIds that have the most views
 *
 */
const getTopSixArticleIds = viewsCount => {
	if (Object.keys(viewsCount).length === 0) {
		return [];
	}

	let topSix = [];
	let countPlaceholder = Object.assign({}, viewsCount);

	/** Loop through key, values of the viewsByArticle object 3 times to find the key with the largest number of views
	 *  This implies that we are only returning 3 articles and can be updated as needed
	 */
	for (let i = 0; i < 6; i++) {
		// Find the key with the highest value
		let highestKey = Object.keys(countPlaceholder).reduce((a, b) =>
			countPlaceholder[a] > countPlaceholder[b] ? a : b
		);

		// Push that id to the topThreeArticleIds array
		topSix.push(highestKey);

		// Remove that key from the viewsByArticle so that it will not be included in the next check
		delete countPlaceholder[highestKey];
	}

	return topSix;
};

/**
 * @description Take an array of 3 article ids with the most views and return the article documents themselves
 * @param {Array<mongoose.Schema.Types.ObjectId>} topThreeIds An array that contains the ids of the top 3 most viewed articles
 * @returns {Array<mongoose.Document>} An array that contains the 3 article documents that have the most views
 */
const getTopSixArticles = async topSixIds => {
	if (topSixIds.length === 0) {
		return [];
	}

	let topSixArticles = [];

	/** Loop through the topThreeArticleIds array to find each article document
	 *	This implies that we are only returning 3 articles and can be updated as needed
	 */
	for (let i = 0; i < topSixIds.length; i++) {
		// Find the corresponding article document
		let article = await Article.findById(topSixIds[i]);

		// Push the article document to the topThreeArticles array
		topSixArticles.push(article);
	}

	return topSixArticles;
};
