const { Request, Response, NextFunction } = require('express');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

const bcrypt = require('bcryptjs');
const moment = require('moment');

/**
 * @description Get all users
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getAllUsers = async (req, res, next) => {
	const { start, limit } = req;

	const users = await User.find().skip(start).limit(limit);
	const totalUsers = await User.estimatedDocumentCount();

	res.status(200).json({
		success: true,
		users,
		totalUsers,
	});
};

exports.getAllUsers = asyncHandler(_getAllUsers);

/**
 * @description Get all admin
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getAllAdmin = async (req, res, next) => {
	const admin = await User.find({ role: { $lt: 3 } });
	const totalAdmin = await User.find({ role: { $lt: 3 } }).countDocuments();

	res.status(200).json({
		success: true,
		users: admin,
		totalUsers: totalAdmin,
	});
};

exports.getAllAdmin = asyncHandler(_getAllAdmin);

/**
 * @description Get one user
 * @param {Request} req Express request objet
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getUserById = async (req, res, next) => {
	const { userId } = req.params;

	const user = await User.findById(userId);

	res.status(200).json({
		success: true,
		user,
	});
};

exports.getUserById = asyncHandler(_getUserById);

/**
 * @description Update a single user details
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _updateUserDetails = async (req, res, next) => {
	const { userId } = req.params;
	const { name, email, phone } = req.body;

	const updatedUser = await User.findByIdAndUpdate(
		userId,
		{
			$set: {
				name,
				email,
				phone,
			},
		},
		{ new: true }
	);

	res.status(200).json({
		success: true,
		updatedUser,
	});
};

exports.updateUserDetails = asyncHandler(_updateUserDetails);

// @desc      Get single user
// @route     GET /api/v1/auth/users/:id
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc      Create user
// @route     POST /api/v1/auth/users
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
	const user = await User.create(req.body);

	res.status(201).json({
		success: true,
		data: user,
	});
});

// @desc      Update user
// @route     PUT /api/v1/auth/users/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc      Update user
// @route     PATCH /api/v1/auth/users/:id
// @access    Private/Admin
exports.patchUserLoggedIn = asyncHandler(async (req, res, next) => {
	console.log('function started');

	const salt = await bcrypt.genSalt(10);

	const password = await bcrypt.hash(req.body.password, salt);
	console.log(password);
	const body = {
		hasSignedInBefore: true,
		password: password,
	};
	const user = await User.findByIdAndUpdate(req.user.id, body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc      Update user
// @route     PATCH /api/v1/auth/users/:id
// @access    Private/Admin
exports.patchUser = asyncHandler(async (req, res, next) => {
	console.log('function started');

	const user = await User.findByIdAndUpdate(req.params.id, body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc      Verify user phone number
// @route     POST /api/v1/users/phone/verify
// @access    Private
exports.verifyPhoneNumber = asyncHandler(async (req, res, next) => {
	const accountSid = process.env.TWILIO_ACCOUNT_SID;
	const authToken = process.env.TWILIO_AUTH_TOKEN;
	const client = require('twilio')(accountSid, authToken);

	const code = Math.random().toString(36).substr(2, 6).toUpperCase();
	const body = `Hello from [Insert Company Name]. Your Phone verification code is ${code}`;
	const phone = req.body.phone;

	const phoneInfo = {
		phoneVerificationInformation: {
			phoneCode: code,
			phoneCodeExpire: moment(new Date()).add(30, 'm').toDate(),
		},
	};

	const user = await User.findByIdAndUpdate(req.user.id, phoneInfo, {
		new: true,
		runValidators: true,
	});
	if (user) {
		client.messages
			.create({
				body: body,
				from: process.env.ORIGIN_PHONE_NUMBER,
				to: phone,
			})
			.then(response => res.status(201).json({ success: true, data: response }))
			.catch(err => {
				res.status(400).json({ success: false, data: '' });
			});
	}
});

// @desc      Verify code sent to user
// @route     POST /api/v1/users/phone/verify/:id
// @access    Private
exports.verifyCode = asyncHandler(async (req, res, next) => {
	const code = req.params.id;
	const user = await User.findById(req.user.id);
	const date = new Date();
	const phone = req.body.phone;

	const body = {
		phone: phone.toString(),
		isPhoneVerified: true,
	};

	if (user.phoneVerificationInformation.phoneCode == code.toString()) {
		let patchUser = await User.findByIdAndUpdate(req.user.id, body, {
			new: true,
			runValidators: true,
		}).then(response => {
			res.status(202).json({
				success: true,
				data: 'Phone has been verified',
			});
		});
	} else {
		res.status(400).json({
			success: false,
			data: 'could not verify',
		});
	}
});

// @desc      Delete user
// @route     DELETE /api/v1/auth/users/:id
// @access    Private/Admin
exports.getHOAEmployees = asyncHandler(async (req, res, next) => {
	console.log(req.body);
	console.log(req.params);
	//find user by passed in token id
	const user = await User.findById(req.user.id);
	const orgName = req.params.orgName;

	const result = await User.find({
		'organizations.orgName': orgName,
		'isHOA': true,
	});
	result2 = await Organizations.find({});

	res.status(200).json({
		success: true,
		data: result,
		extraData: result2,
	});
});

// @desc      Delete user
// @route     DELETE /api/v1/auth/users/:id
// @access    Private/Admin
exports.getHOAEmployeesName = asyncHandler(async (req, res, next) => {
	console.log(req.body);
	console.log(req.params);
	//find user by passed in token id
	const user = await User.findById(req.user.id);
	const orgName = req.params.orgName;
	const name = req.params.name;

	const result = await User.find({
		'organizations.orgName': orgName,
		'isHOA': true,
		'name': { $regex: name, $options: 'i' },
	});

	res.status(200).json({
		success: true,
		data: result,
	});
});

// @desc      Delete user
// @route     DELETE /api/v1/auth/users/:id
// @access    Private/Admin
exports.searchOrgEmployees = asyncHandler(async (req, res, next) => {
	console.log('here');
	//find user by passed in token id
	const user = await User.findById(req.user.id);
	const { orgName, searchString } = req.params;

	const result = await User.find({
		'organizations.orgName': orgName,
		'name': { $regex: searchString, $options: 'i' },
	});

	console.log(result);
	res.status(200).json({
		success: true,
		data: result,
	});
});

// @desc      Delete user
// @route     DELETE /api/v1/auth/users/:id
// @access    Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
	await User.findByIdAndDelete(req.params.id);

	res.status(200).json({
		success: true,
		data: {},
	});
});
