const { Request, Response, NextFunction } = require('express');
const ArticleComment = require('../../models/ArticleComment');
const { parse, subDays, endOfDay, startOfDay, subWeeks, subMonths } = require('date-fns');
const asyncHandler = require('../../middleware/async');

/**
 * @description Get the total count of comments created within a user defined range
 * @query startDate - start date of the custom range as YYYY-MM-DD
 * @query endDate - end date of the custom range as YYYY-MM-DD
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getCommentCountForCustomRange = async (req, res, next) => {
	const { startDate, endDate } = req.query;

	const start = startOfDay(parse(startDate, 'yyyy-MM-dd', new Date(startDate)));
	const end = endOfDay(parse(endDate, 'yyyy-MM-dd', new Date(startDate)));

	const count = await ArticleComment.where('createdAt').gte(start).lte(end).countDocuments();

	res.status(200).json({
		success: true,
		count,
	});
};

exports.getCommentCountForCustomRange = asyncHandler(_getCommentCountForCustomRange);

/**
 * @description Get the total count of comments created within the last day
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getCommentCountForLastDay = async (req, res, next) => {
	const today = endOfDay(new Date());
	const yesterday = startOfDay(subDays(today, 1));

	const count = await ArticleComment.where('createdAt').gte(yesterday).lte(today).countDocuments();

	res.status(200).json({
		success: true,
		count,
	});
};

exports.getCommentCountForLastDay = asyncHandler(_getCommentCountForLastDay);

/**
 * @description Get the total count of comments created within the last week
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getCommentCountForLastWeek = async (req, res, next) => {
	const today = endOfDay(new Date());
	const lastWeek = startOfDay(subWeeks(today, 1));

	const count = await ArticleComment.where('createdAt').gte(lastWeek).lte(today).countDocuments();

	res.status(200).json({
		success: true,
		count,
	});
};

exports.getCommentCountForLastWeek = asyncHandler(_getCommentCountForLastWeek);

/**
 * @description Get the total count of comments created within the last month
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getCommentCountForLastMonth = async (req, res, next) => {
	const today = endOfDay(new Date());
	const lastMonth = startOfDay(subMonths(today, 1));

	const count = await ArticleComment.where('createdAt').gte(lastMonth).lte(today).countDocuments();

	res.status(200).json({
		success: true,
		count,
	});
};

exports.getCommentCountForLastMonth = asyncHandler(_getCommentCountForLastMonth);
