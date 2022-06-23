const { Request, Response, NextFunction } = require('express');
const { Document } = require('mongoose');
const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * @description Register user
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _register = async (req, res, next) => {
	const { name, email, password } = req.body;

	const userExists = await User.findOne({ email });

	if (!userExists) {
		const user = await User.create({
			name,
			email,
			password,
		});

		sendRefreshTokenResponse(user, 201, res);
	} else {
		return next(new ErrorResponse(`User with email ${email} already exists`, 400));
	}
};

exports.register = asyncHandler(_register);

/**
 * @description Login user
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _login = async (req, res, next) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email }).select('+password');

	if (user) {
		const isMatch = await bcrypt.compare(password, user.password);

		if (isMatch) {
			if (!user.hasSignedInBefore) {
				await user.updateOne({
					$set: {
						hasSignedInBefore: true,
					},
				});
			}

			sendRefreshTokenResponse(user, 200, res);
		} else {
			return next(new ErrorResponse('Invalid email or password', 400));
		}
	} else {
		return next(new ErrorResponse(`User with email ${email} not found`, 400));
	}
};

exports.login = asyncHandler(_login);

/**
 * @description Logout user
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _logout = async (req, res, next) => {
	res.status(200).json({
		success: true,
	});
};
exports.logout = asyncHandler(_logout);

/**
 * @description Get current logged in user
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getMe = async (req, res, next) => {
	const { id } = req.user;

	const user = await User.findById(id);

	res.status(200).json({
		success: true,
		user,
	});
};

exports.getMe = asyncHandler(_getMe);

/**
 * @description Update a user details
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _updateDetails = async (req, res, next) => {
	const fieldsToUpdate = {
		name: req.body.name,
		email: req.body.email,
		phone: req.body.phone,
	};

	const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		user,
	});
};

exports.updateDetails = asyncHandler(_updateDetails);

/**
 * @description Update password
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _updatePassword = async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password');

	// Check current password
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse('Password is incorrect', 401));
	}

	user.password = req.body.newPassword;
	await user.save();

	sendTokenResponse(user, 200, res);
};

exports.updatePassword = asyncHandler(_updatePassword);

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
/**
 * @description Forgot password
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _forgotPassword = async (req, res, next) => {
	const { email } = req.body;

	const user = await User.findOne({ email });

	if (!user) {
		res.status(201).json({ success: true, message: 'No user with that email' });
	} else {
		// Get reset token
		const resetToken = user.getResetPasswordToken();

		await user.save({ validateBeforeSave: false });

		// Create reset url
		const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

		const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Enter your authentication token at the 'forgot password' screen: ${resetToken}`;

		try {
			await sendEmail({
				email: Uint16Array,
				subject: 'Password reset token',
				message,
			});

			res.status(200).json({
				success: true,
				message: 'Email sent',
			});
		} catch (error) {
			console.log(error);
			user.resetPasswordToken = undefined;
			user.resetPasswordExpire = undefined;

			await user.save({ validateBeforeSave: false });

			next(new ErrorResponse('Email could not be sent', 500));
		}
	}
};

exports.forgotPassword = asyncHandler(_forgotPassword);

/**
 * @description Issue new access token
 * @param {Request} req Express request object
 * @param {Response} res Express repsonse object
 * @param {NextFunction} next Express next function
 */
const _refreshAccessToken = async (req, res, next) => {
	const { id } = req.user;

	const user = await User.findById(id);

	sendTokenResponse(user, 200, res);
};

exports.refreshAccessToken = asyncHandler(_refreshAccessToken);

/**
 * @description Reset password
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _resetPassword = async (req, res, next) => {
	// Get hashed token
	const resetPasswordToken = crypto
		.createHash('sha256')
		.update(req.params.resettoken)
		.digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		res.status(201).json({ success: false, data: 'There was an error. Try again.' });
	}

	// Set new password
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	await user.save();

	sendTokenResponse(user, 200, res);
};

exports.resetPassword = asyncHandler(_resetPassword);

//reset password test

exports.sendForgotCode = () => {};

/**
 * @description Get access token from model and send response
 * @param {Document} user User document to create token for
 * @param {number} statusCode Status code to send with response
 * @param {Response} res Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
	// Create token
	const accessToken = user.getSignedJwtToken();

	res.status(statusCode).json({
		success: true,
		accessToken,
	});
};

/**
 * @description Get access & refresh token from model and send response
 * @param {Document} user User document to create token for
 * @param {number} statusCode Status code to send with response
 * @param {Response} res Express response object
 */
const sendRefreshTokenResponse = (user, statusCode, res) => {
	// Create Tokens
	const accessToken = user.getSignedJwtToken();
	const refreshToken = user.getSignedRefreshToken();

	res.status(statusCode).json({
		success: true,
		accessToken,
		refreshToken,
	});
};
