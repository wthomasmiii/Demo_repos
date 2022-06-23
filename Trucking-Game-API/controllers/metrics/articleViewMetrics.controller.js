const { Request, Response, NextFunction } = require('express');
const ArticleView = require('../../models/ArticleView');
const Article = require('../../models/Article');
const { parse, startOfDay, endOfDay, subDays, subWeeks, subMonths } = require('date-fns');
const mongoose = require('mongoose');
const asyncHandler = require('../../middleware/async');

/**
 * @description Get top 3 articles with the most views within a user defined date range
 * @query startDate - start date of the custom range as YYYY-MM-DD
 * @query endDate - end date of the custom range as YYYY-MM-DD
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getTopViewedArticlesForCustomRange = async (req, res, next) => {
	const { startDate, endDate } = req.query;

	let articleData = [];

	const start = startOfDay(parse(startDate, 'yyyy-MM-dd', new Date(startDate)));
	const end = endOfDay(parse(endDate, 'yyyy-MM-dd', new Date(startDate)));

	// Find all article views within the date range
	const views = await ArticleView.where('timestamp').gte(start).lte(end);

	// Loop through the found article views and returns an object with each unique article id as the key and the count of views as the value
	let viewsByArticle = getViewsCount(views);
	// Iterate through the object of counts and return an array that contains the 3 article ids with the most views
	let topThreeArticleIds = getTopThreeArticleIds(viewsByArticle);
	// Iterate through the array of article ids and return an array that contains an object containing the count and it's corresponding article
	let topThreeArticles = await getTopThreeArticles(topThreeArticleIds);

	for (let i = 0; i < topThreeArticles.length; i++) {
		let currentId = topThreeArticles[i].id;

		articleData.push({
			views: viewsByArticle[currentId],
			article: topThreeArticles[i],
		});
	}

	res.status(200).json({
		success: true,
		articles: articleData,
	});
};

exports.getTopViewedArticlesForCustomRange = asyncHandler(_getTopViewedArticlesForCustomRange);

/**
 * @description Get top 3 articles with the most views within the last day
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getTopViewedArticlesForLastDay = async (req, res, next) => {
	let articleData = [];
	const today = endOfDay(new Date());
	const yesterday = startOfDay(subDays(today, 1));

	const views = await ArticleView.where('timestamp').gte(yesterday).lte(today);

	// Loop through the found article views and returns an object with each unique article id as the key and the count of views as the value
	let viewsByArticle = getViewsCount(views);
	// Iterate through the object of counts and return an array that contains the 3 article ids with the most views
	let topThreeIds = getTopThreeArticleIds(viewsByArticle);
	// Iterate through the array of article ids and return an array that contains an object containing the count and it's corresponding article
	let topThreeArticles = await getTopThreeArticles(topThreeIds);

	for (let i = 0; i < topThreeArticles.length; i++) {
		let currentId = topThreeArticles[i].id;

		articleData.push({
			views: viewsByArticle[currentId],
			article: topThreeArticles[i],
		});
	}

	res.status(200).json({
		success: true,
		articles: articleData,
	});
};

exports.getTopViewedArticlesForLastDay = asyncHandler(_getTopViewedArticlesForLastDay);

/**
 * @description Get top 3 articles with the most views within the last week
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getTopViewedArticlesForLastWeek = async (req, res, next) => {
	let articleData = [];
	const today = endOfDay(new Date());
	const lastWeek = startOfDay(subWeeks(today, 1));

	const views = await ArticleView.where('timestamp').gte(lastWeek).lte(today);

	// Loop through the found article views and returns an object with each unique article id as the key and the count of views as the value
	let viewsByArticle = getViewsCount(views);
	// Iterate through the object of counts and return an array that contains the 3 article ids with the most views
	let topThreeIds = getTopThreeArticleIds(viewsByArticle);
	// Iterate through the array of article ids and return an array that contains an object containing the count and it's corresponding article
	let topThreeArticles = await getTopThreeArticles(topThreeIds);

	for (let i = 0; i < topThreeArticles.length; i++) {
		let currentId = topThreeArticles[i].id;

		articleData.push({
			views: viewsByArticle[currentId],
			article: topThreeArticles[i],
		});
	}

	res.status(200).json({
		success: true,
		articles: articleData,
	});
};

exports.getTopViewedArticlesForLastWeek = asyncHandler(_getTopViewedArticlesForLastWeek);

/**
 * @description Get top 3 articles with the most views within the last month
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getTopViewedArticlesForLastMonth = async (req, res, next) => {
	let articleData = [];
	const today = endOfDay(new Date());
	const lastMonth = startOfDay(subMonths(today, 1));

	const views = await ArticleView.where('timestamp').gte(lastMonth).lte(today);

	// Loop through the found article views and returns an object with each unique article id as the key and the count of views as the value
	let viewsByArticle = getViewsCount(views);
	// Iterate through the object of counts and return an array that contains the 3 article ids with the most views
	let topThreeIds = getTopThreeArticleIds(viewsByArticle);
	// Iterate through the array of article ids and return an array that contains an object containing the count and it's corresponding article
	let topThreeArticles = await getTopThreeArticles(topThreeIds);

	for (let i = 0; i < topThreeArticles.length; i++) {
		let currentId = topThreeArticles[i].id;

		articleData.push({
			views: viewsByArticle[currentId],
			article: topThreeArticles[i],
		});
	}

	res.status(200).json({
		success: true,
		articles: articleData,
	});
};

exports.getTopViewedArticlesForLastMonth = asyncHandler(_getTopViewedArticlesForLastMonth);

/**
 * @description Log the view of an article
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _createArticleView = async (req, res, next) => {
	const { articleId } = req.body;
	const { id } = req.user;

	const validArticle = await Article.findById(articleId);

	if (validArticle) {
		const articleView = await ArticleView.create({
			article: articleId,
			user: id,
		});

		res.status(201).json({
			success: true,
			articleView,
		});
	} else {
		next(new ErrorResponse(`Article with id ${articleId} does not exist`, 400));
	}
};

exports.createArticleView = asyncHandler(_createArticleView);

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
const getTopThreeArticleIds = viewsCount => {
	if (Object.keys(viewsCount).length === 0) {
		return [];
	}

	let topThree = [];
	let countPlaceholder = Object.assign({}, viewsCount);

	/** Loop through key, values of the viewsByArticle object 3 times to find the key with the largest number of views
	 *  This implies that we are only returning 3 articles and can be updated as needed
	 */
	for (let i = 0; i < 3; i++) {
		// Find the key with the highest value
		let highestKey = Object.keys(countPlaceholder).reduce((a, b) =>
			countPlaceholder[a] > countPlaceholder[b] ? a : b
		);

		// Push that id to the topThreeArticleIds array
		topThree.push(highestKey);

		// Remove that key from the viewsByArticle so that it will not be included in the next check
		delete countPlaceholder[highestKey];
	}

	return topThree;
};

/**
 * @description Take an array of 3 article ids with the most views and return the article documents themselves
 * @param {Array<mongoose.Schema.Types.ObjectId>} topThreeIds An array that contains the ids of the top 3 most viewed articles
 * @returns {Array<mongoose.Document>} An array that contains the 3 article documents that have the most views
 */
const getTopThreeArticles = async topThreeIds => {
	if (topThreeIds.length === 0) {
		return [];
	}

	let topThreeArticles = [];

	/** Loop through the topThreeArticleIds array to find each article document
	 *	This implies that we are only returning 3 articles and can be updated as needed
	 */
	for (let i = 0; i < topThreeIds.length; i++) {
		// Find the corresponding article document
		let article = await Article.findById(topThreeIds[i]);

		// Push the article document to the topThreeArticles array
		topThreeArticles.push(article);
	}

	return topThreeArticles;
};
