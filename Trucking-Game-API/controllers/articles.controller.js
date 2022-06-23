const { Request, Response, NextFunction } = require('express');
const Article = require('../models/Article');
const Category = require('../models/Category');
const User = require('../models/User');
const generateSlug = require('../utils/generateSlug');
const ArticleComment = require('../models/ArticleComment');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const { Query, Document } = require('mongoose');

/**
 * @description Gets one article by slug
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getOneBySlug = async (req, res, next) => {
	const { slug } = req.params;
	const { user } = req;

	let validArticle = await Article.findOne({ slug }).populate('author', '-password');

	if (validArticle) {
		if (validArticle.isFree) {
			return res.status(200).json({ article: validArticle, success: true });
		} else {
			if (user.role < 3 || user.hasPaid) {
				return res.status(200).json({
					article: validArticle,
					success: true,
				});
			} else {
				return next(new ErrorResponse('Upgrade account to access this article', 204));
			}
		}
	} else {
		return next(new ErrorResponse(`Article with slug ${slug} does not exist`, 400));
	}
};

exports.getOneBySlug = asyncHandler(_getOneBySlug);

/**
 * @description Get all available authors for filter options
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getAuthorOptions = async (req, res, next) => {
	let authors = [];

	const articles = await Article.find();

	for (let i = 0; i < articles.length; i++) {
		if (authors.findIndex(author => author.id === articles[i].author.id) === -1) {
			authors.push(articles[i].author);
		}
	}

	res.status(200).json({
		success: true,
		authors,
	});
};

exports.getAuthorOptions = asyncHandler(_getAuthorOptions);

/**
 * @description Gets all articles matching the provided query parameters
 * - tags: An array of tags to filter by
 * - authorId: Id of a user to filter by
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getArticlesByQuery = async (req, res, next) => {
	const { tags, authorId } = req.query;
	const { limit, start } = req;

	// Check whether or not user has access to paid articles
	const hasPaidAccess = req.user.role < 3 || req.user.hasPaid;

	// Execute Query
	const { ok, articles, totalDocuments } = await executeSearchQuery(
		{ limit, start, tags, authorId },
		hasPaidAccess
	);
	console.log(totalDocuments);

	if (!ok) {
		return next(new ErrorResponse('Error occurred while execuiting search query', 400));
	}

	res.status(200).json({
		success: true,
		totalDocuments,
		articles,
	});
};

exports.getArticlesByQuery = asyncHandler(_getArticlesByQuery);

/**
 * @description Get all comments pertaining to a specific article
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getCommentsByArticle = async (req, res, next) => {
	const { articleSlug } = req.params;

	const article = await Article.findOne({ slug: articleSlug });
	const comments = await ArticleComment.find({ relatedArticle: article._id }).sort({
		createdAt: 'asc',
	});

	res.status(200).json({
		success: true,
		comments,
	});
};

exports.getCommentsByArticle = asyncHandler(_getCommentsByArticle);

/**
 * @description Creates a new article
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _addArticle = async (req, res, next) => {
	const { title, htmlBody, textBody, tags, category, isFree } = req.body;
	const { id } = req.user;

	if (!title || !htmlBody || !textBody || !category || isFree === null) {
		next(new ErrorResponse('All fields are required', 400));
	}

	const validCategory = await Category.findById(category);

	if (validCategory) {
		const slug = await generateSlug(title);

		if (slug.message) {
			next(new ErrorResponse('Error occurred while generating slug', 400));
		}

		const newArticle = await Article.create({
			author: id,
			slug,
			category: validCategory._id,
			title,
			htmlBody,
			textBody,
			tags,
			isFree,
		});

		/** Update the article count for the category that this article falls under */
		await validCategory.updateOne({
			$set: {
				numberOfArticles: validCategory.numberOfArticles + 1,
			},
		});

		res.status(201).json({
			success: true,
			article: newArticle,
		});
	} else {
		next(new ErrorResponse(`Category with id ${category} does not exist`, 400));
	}
};

exports.addArticle = asyncHandler(_addArticle);

/**
 * @description Create a new comment on a specific article
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _addArticleComment = async (req, res, next) => {
	const { articleId } = req.params;
	const { text } = req.body;
	const { id } = req.user;

	if (!text) {
		next(new ErrorResponse('Text field is required', 400));
	}

	const validArticle = await Article.findById(articleId);

	if (validArticle) {
		const newComment = await ArticleComment.create({
			text,
			relatedArticle: articleId,
			user: id,
		});

		validArticle.comments.push(newComment._id);
		await validArticle.save();

		res.status(201).json({
			success: true,
			comment: newComment,
		});
	} else {
		next(new ErrorResponse(`Article with id ${articleId} does not exist`, 400));
	}
};

exports.addArticleComment = asyncHandler(_addArticleComment);

/**
 * @description Deletes a single article
 * @param {Request} req Express request object
 * @param {Response} res Express repsonse object
 * @param {NextFunction} next Express next function
 */
const _deleteOneArticle = async (req, res, next) => {
	const { articleId } = req.params;

	const validArticle = await Article.findById(articleId);

	if (validArticle) {
		await validArticle.remove();

		res.status(200).json({ message: 'Successfully deleted article', success: true });
	} else {
		next(new ErrorResponse(`Article with id ${articleId} does not exist`, 400));
	}
};

exports.deleteOneArticle = asyncHandler(_deleteOneArticle);

/**
 * @description Deletes multiple articles
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _deleteMultipleArticles = async (req, res, next) => {
	const { articleId } = req.query;

	if (articleId) {
		next(new ErrorResponse('Query parameters are required', 400));
	}

	let incompleteIds = [...id];

	for (let x = 0; x < id.length; x++) {
		let validArticle = await Article.findById(id[x]);

		if (validArticle) {
			await validArticle.remove();
			// When an article is successfully deleted, it gets removed from incompleteIds array
			incompleteIds.shift();

			continue;
		} else {
			break;
		}
	}

	if (incompleteIds.length > 0) {
		res.status(400).json({
			success: false,
			message: 'One or more articles was not found',
			incomplete: incompleteIds,
		});
	} else {
		res.status(200).json({ message: 'Successfully deleted articles', success: true });
	}
};

exports.deleteMultipleArticles = asyncHandler(_deleteMultipleArticles);

/**
 * @description Updates a single article
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _updateArticle = async (req, res, next) => {
	// Extract article id from the request parameters
	const { articleId } = req.params;

	// Extract the updated htmlBody and textBody from the request body
	const { htmlBody, textBody, tags, title, category, isFree } = req.body;

	const validArticle = await Article.findById(articleId);
	const newCategory = await Category.findById(category);

	if (validArticle) {
		if (newCategory) {
			// Attempt to update the article
			const updatedArticle = await Article.findByIdAndUpdate(
				articleId,
				{
					$set: {
						htmlBody,
						textBody,
						tags,
						title,
						category,
						isFree,
					},
				},
				{ new: true }
			);

			res.status(200).json({
				success: true,
				updatedArticle,
			});
		} else {
			next(new ErrorResponse(`Category with id ${category} does not exist`, 400));
		}
	} else {
		// If article does not exist return ErrorResponse
		next(new ErrorResponse(`Article with id ${articleId} does not exist`, 400));
	}
};

exports.updateArticle = asyncHandler(_updateArticle);

/**
 * @description Toggle whether editing on an article is locked to its original creator or open to all admin
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _toggleEditingLocked = async (req, res, next) => {
	const { articleId } = req.params;

	const article = await Article.findById(articleId);

	if (article.author.id.toString() === req.user.id.toString()) {
		await article.toggleEditingLocked();

		res.status(200).json({
			success: true,
			article,
		});
	} else {
		next(
			new ErrorResponse(
				'Only the author of this article is authorized to access this resource',
				400
			)
		);
	}
};

exports.toggleEditingLocked = asyncHandler(_toggleEditingLocked);

/**
 *
 * @param {{limit: number, start: number, tags: string[] | string, authorId: string}} queryParams
 * @param {boolean} hasPaidAccess
 * @returns {Promise<{ ok: boolean, articles?: Document[], totalDocuments?: number}>}
 */
const executeSearchQuery = async ({ limit, start, tags, authorId }, hasPaidAccess) => {
	try {
		// Return variables
		let articles;
		let totalDocumentsThatMatchQuery;

		// Set up initial query
		let articlesQuery = Article.find();
		let totalDocumentsQuery = Article.find();

		// If user doesn't have paid access
		if (!hasPaidAccess) {
			articlesQuery = articlesQuery.where('isFree').equals(true);
			totalDocumentsQuery = totalDocumentsQuery.where('isFree').equals(true);
		}

		if (tags) {
			articlesQuery = articlesQuery.where('tags').in(tags);
			totalDocumentsQuery = totalDocumentsQuery.where('tags').in(tags);
		}

		if (authorId) {
			articlesQuery = articlesQuery.where('author').equals(authorId);
			totalDocumentsQuery = totalDocumentsQuery.where('author').equals(authorId);
		}

		articlesQuery = articlesQuery.sort('-createdAt').skip(start).limit(limit);

		articles = await articlesQuery;
		totalDocumentsThatMatchQuery = await totalDocumentsQuery.countDocuments();

		return {
			ok: true,
			articles,
			totalDocuments: totalDocumentsThatMatchQuery,
		};
	} catch (error) {
		console.log(error);
		return {
			ok: false,
		};
	}
};
