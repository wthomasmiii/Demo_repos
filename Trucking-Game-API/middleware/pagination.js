const { Request, Response, NextFunction } = require('express');
const { Model, Query } = require('mongoose');

/**
 * @description Validates the pagination parameters for routes that require pagination
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const pagination = (req, res, next) => {
	let { limit, page } = req.query;

	limit = parseInt(limit);
	page = parseInt(page);

	if (!limit) {
		limit = 10;
	}
	if (!page) {
		page = 1;
	}
	if (limit > 100) {
		return res.status(400).json({ message: 'Limit has exceeded maximum of 100' });
	}

	req.limit = limit;
	req.start = (page - 1) * limit;

	next();
};

module.exports = pagination;
