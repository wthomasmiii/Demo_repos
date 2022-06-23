const router = require('express').Router();
const {
	getAllCategories,
	getArticlesByCategoryQuery,
	getCategoryById,
	addCategory,
	deleteMultipleCategories,
	deleteOneCategory,
	updateCategory,
	getCategoryOptions,
} = require('../../../controllers/categories.controller');
const { protect } = require('../../../middleware/auth');
const pagination = require('../../../middleware/pagination');

/**
 * @method GET /api/v1/categories
 * @description Get all categories
 * @access Public | Auth
 */
router.get('/', protect, pagination, getAllCategories);

/**
 * @method GET /api/v1/categories/options
 * @description Get all category options
 * @access Public | Auth | Admin
 */
router.get('/options', protect, getCategoryOptions);

/**
 * @method GET /api/v1/categories/search?categoryId=[string]
 * @description Gets a collection of articles by 1 or more categories
 * @access Public | Auth
 */
router.get('/search', protect, pagination, getArticlesByCategoryQuery);

/**
 * @method GET /api/v1/categories/:id
 * @description Gets one category by slug
 * @access Public | Auth
 */
router.get('/:categoryId', protect, getCategoryById);

/**
 * @method POST /api/v1/categories
 * @description Creates a new category
 * @access Public | Auth | Admin
 */
router.post('/', protect, addCategory);

/**
 * @method DELETE /api/v1/categories/multiple?id=[string]
 * @description Deletes multiple categories
 * @access Public | Auth | Admin
 */
router.delete('/multiple', protect, deleteMultipleCategories);

/**
 * @method DELETE /api/v1/categories/:id
 * @description Deletes a single category
 * @access Public | Auth | Admin
 */
router.delete('/:id', protect, deleteOneCategory);

/**
 * @method PATCH /api/v1/categories/:id
 * @description Updates a single category
 * @access Public | Auth | Admin
 */
router.patch('/:id', protect, updateCategory);

module.exports = router;
