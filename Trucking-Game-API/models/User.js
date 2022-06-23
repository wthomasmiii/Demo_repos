const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDateString } = require('../utils/dateHelper');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please add a name'],
	},
	email: {
		type: String,
		required: [true, 'Please add an email'],
		unique: true,
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
	},
	role: {
		type: Number,
		enum: [1, 2, 3, 4],
		default: 1,
	},
	password: {
		type: String,
		required: [true, 'Please add a password'],
		minlength: 6,
		select: false,
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: function () {
			return new Date();
		},
	},
	hasSignedInBefore: {
		type: Boolean,
		default: false,
	},
	phone: {
		type: String,
		default: '',
	},
	isPhoneVerified: {
		type: Boolean,
		default: false,
	},
	phoneVerificationInformation: {
		phoneCode: {
			type: String,
		},
		phoneCodeExpire: {
			type: Date,
		},
	},
	profileImage: {
		type: String,
		default: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Placeholder_no_text.svg',
	},
	hasPaid: {
		type: Boolean,
		default: false,
	},
});

/****************THIS IS A DEPENDENCY ERROR SECTION**************** */
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

// Sign Refresh JWT and return
UserSchema.methods.getSignedRefreshToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_REFRESH_EXPIRE * 1000 * 24 * 60 * 60,
	});
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = function (enteredPassword) {
	return bcrypt.compare(enteredPassword, this.password);
};

/**********************************END*********************************** */

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
	// Generate token
	const resetToken = crypto.randomBytes(20).toString('hex');

	// Hash token and set to resetPasswordToken field
	this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

	// Set expire
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

// Update user to reflect the upgrade of their account
UserSchema.methods.upgradeAccount = async function () {
	this.hasPaid = true;
	await this.save();
};

UserSchema.set('toJSON', {
	transform: (doc, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		returnedObject.createdAt = getDateString(doc.createdAt);

		delete returnedObject._id;
		delete returnedObject.__v;
		delete returnedObject.resetPasswordToken;
		delete returnedObject.resetPasswordExpire;
	},
});
module.exports = mongoose.model('User', UserSchema);
