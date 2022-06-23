const express = require('express');
const {
	register,
	login,
	logout,
	getMe,
	forgotPassword,
	resetPassword,
	updateDetails,
	updatePassword,
	registerFranchise,
	refreshAccessToken,
} = require('../../../../controllers/auth');

const router = express.Router();

const { protect, authorize } = require('../../../../middleware/auth');

router.post('/login', login);
router.get('/logout', logout);
router.post('/register', register);
router.get('/me', protect, getMe);
router.get('/refreshToken', protect, refreshAccessToken);
router.patch('/updateDetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
