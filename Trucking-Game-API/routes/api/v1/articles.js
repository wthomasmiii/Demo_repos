const router = require('express').Router();
const {
	addArticle,
	addArticleComment,
	deleteMultipleArticles,
	deleteOneArticle,
	getArticlesByQuery,
	getOneBySlug,
	updateArticle,
	getCommentsByArticle,
	toggleEditingLocked,
	getAuthorOptions,
} = require('../../../controllers/articles.controller');
const pagination = require('../../../middleware/pagination');
const { protect, authorize } = require('../../../middleware/auth');

/**
 * @method GET /api/v1/articles/authors
 * @description Get all authors for options
 * @access Public | Auth
 */
router.get('/authors', protect, getAuthorOptions);

/**
 * @method GET /api/v1/articles/search?tags={[string]}&authorId={string}
 * @description Gets all articles matching the provided query parameters
 * @access Public | Auth
 */
router.get('/search', protect, pagination, getArticlesByQuery);

/**
 * @method GET /api/v1/articles/:slug
 * @description Get one article by slug
 * @access Public | Auth
 */
router.get('/:slug', protect, getOneBySlug);

/**
 * @method GET /api/v1/articles/:articleId/comments
 * @description Get comments pertaining to a specific article
 * @access Public | Auth
 */
router.get('/:articleSlug/comments', protect, getCommentsByArticle);

/**
 * @method POST /api/v1/articles
 * @description Create a new article
 * @access Public | Auth | Admin
 */
router.post('/', protect, authorize(1, 2), addArticle);

/**
 * @method POST /api/v1/articles/:articleId/comment
 * @description Create a new comment on a specific article
 * @access Public | Auth
 */
router.post('/:articleId/comment', protect, addArticleComment);

/**
 * @method DELETE /api/v1/articles/multiple?id=[ObjectId]
 * @description Deletes multiple articles
 * @access Public | Auth | Admin
 */
router.delete('/multiple', protect, authorize(1, 2), deleteMultipleArticles);

/**
 * @method DELETE /api/v1/articles/:id
 * @description Deletes a single article
 * @access Public | Auth | Admin
 */
router.delete('/:articleId', protect, authorize(1, 2), deleteOneArticle);

/**
 * @method PATCH /api/v1/articles/toggleEditing/:articleId
 * @description Toggles the locking of editing ability for an article
 * @access Public | Auth | Admin
 */
router.patch('/toggleEditing/:articleId', protect, authorize(1, 2), toggleEditingLocked);

/**
 * @method PATCH /api/v1/articles/:id
 * @description Updates a single article
 * @access Public | Auth | Admin
 */
router.patch('/:articleId', protect, authorize(1, 2), updateArticle);

module.exports = router;
