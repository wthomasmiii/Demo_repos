const { Request, Response, NextFunction } = require('express');
const Ticket = require('../../models/Ticket');
const {
	parse,
	startOfDay,
	endOfDay,
	subMonths,
	subWeeks,
	eachHourOfInterval,
	eachDayOfInterval,
	getHours,
	getDay,
	addHours,
	eachWeekOfInterval,
	addWeeks,
	subHours,
	eachMonthOfInterval,
	getMonth,
	addMonths,
	startOfMonth,
} = require('date-fns');
const asyncHandler = require('../../middleware/async');

/**
 * @description Get the count of active tickets created within a user defined range
 * @query startDate - start date of the custom range as YYYY-MM-DD
 * @query endDate - end date of the custom range as YYYY-MM-DD
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getActiveTicketCountForCustomRange = async (req, res, next) => {
	const { startDate, endDate } = req.query;

	/**
	 * For this I am assuming that the custom range will be > 1 month.
	 * The data that is returned will be returned as the counts of active tickets within each calender month in the custom range.
	 */
	const start = startOfDay(parse(startDate, 'yyyy-MM-dd', new Date(startDate)));
	const end = endOfDay(parse(endDate, 'yyyy-MM-dd', new Date(endDate)));

	// Find active tickets within the current month
	let ticketsCount = await Ticket.where('status')
		.gt(0)
		.lt(4)
		.where('createdAt')
		.gte(start)
		.lte(end)
		.countDocuments();

	res.status(200).json({
		success: true,
		tickets: ticketsCount,
	});
};

exports.getActiveTicketCountForCustomRange = asyncHandler(_getActiveTicketCountForCustomRange);

/**
 * @description Get the count of active tickets created within the last day
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getActiveTicketCountForLastDay = async (req, res, next) => {
	const now = new Date();
	const yesterday = subHours(now, 24);

	// Find the active tickets within the current hour range
	let ticketsCount = await Ticket.where('status')
		.gt(0)
		.lt(4)
		.where('createdAt')
		.gte(yesterday)
		.lte(now)
		.countDocuments();

	res.status(200).json({
		success: true,
		tickets: ticketsCount,
	});
};

exports.getActiveTicketCountForLastDay = asyncHandler(_getActiveTicketCountForLastDay);

/**
 * @description Get the count of active tickets created within the last week
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getActiveTicketCountForLastWeek = async (req, res, next) => {
	const today = new Date();
	const lastWeek = subWeeks(today, 1);

	// Find the active tickets within the current day
	let ticketsCount = await Ticket.where('status')
		.gt(0)
		.lt(4)
		.where('createdAt')
		.gte(lastWeek)
		.lte(today)
		.countDocuments();

	res.status(200).json({
		success: true,
		tickets: ticketsCount,
	});
};

exports.getActiveTicketCountForLastWeek = asyncHandler(_getActiveTicketCountForLastWeek);

/**
 * @description Get the count of active tickets created within the last day
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getActiveTicketCountForLastMonth = async (req, res, next) => {
	const today = new Date();
	const lastMonth = subMonths(today, 1);

	// Find the active tickets for the current week
	let ticketsCount = await Ticket.where('status')
		.gt(0)
		.lt(4)
		.where('createdAt')
		.gte(lastMonth)
		.lte(today)
		.countDocuments();

	res.status(200).json({
		success: true,
		tickets: ticketsCount,
	});
};

exports.getActiveTicketCountForLastMonth = asyncHandler(_getActiveTicketCountForLastMonth);
