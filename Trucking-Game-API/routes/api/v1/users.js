const express = require('express');
const {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
	patchUserLoggedIn,
	verifyPhoneNumber,
	verifyCode,
	patchUser,
	getAllUsers,
	getAllAdmin,
	getUserById,
	updateUserDetails,
} = require('../../../controllers/users.controller');
const pagination = require('../../../middleware/pagination');

const User = require('../../../models/User');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../../../middleware/advancedResults');
const { protect, authorize, orgVerify } = require('../../../middleware/auth');

router.use(protect);
// router.use(authorize(4, 5, 6));

/**
 * @method GET /api/v1/users
 * @description Get all users
 * @access Public | Admin
 */
router.get('/', authorize(1, 2), pagination, getAllUsers);

/**
 * @method GET /api/v1/users/:userId
 * @description Get a single user
 * @access Public | Auth | Admin
 */
router.get('/:userId', authorize(1, 2), getUserById);

/**
 * @method GET /api/v1/users/admin
 * @description Get all admin
 * @access Public | Admin
 */
router.get('/admin', authorize(1, 2), getAllAdmin);

/**
 * @method PATCH /api/v1/users/:userId
 * @description Update single user details
 * @access Public | Auth
 */
router.patch('/:userId', updateUserDetails);

// router.route('/').get(advancedResults(User), getUsers).post(createUser).patch(patchUserLoggedIn);
// router.route('/phone/verify').post(verifyPhoneNumber);
// router.route('/phone/verify/:id').post(verifyCode);
// router.route('/:id').get(getUser).delete(deleteUser).patch(patchUser);

module.exports = router;
