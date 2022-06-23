const { Request, Response, NextFunction } = require('express');
const moment = require('moment');
/**
 * @description Used to log the body and query of a request. Mainly used when testing routes.
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */

const requestLogger = (req, res, next) => {
	console.log(`*************************REQUEST*****************************`);
	console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
	console.log(`${req.method} ${req.path}`);
	console.log('Body: ', req.body);
	console.log('Query: ', req.query);
	res.on('finish', function () {
		var timestamps = moment().format('MM:DD:yyyy HH:mm:ss');

		console.log(timestamps, this.statusCode);
		console.log(`*************************REQUEST END*****************************`);
	});

	next();
};

module.exports = requestLogger;
