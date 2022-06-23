const { Request, Response, NextFunction } = require('express');
const Category = require('../models/Category');
const Article = require('../models/Article');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @description Get all categories for options
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getCategoryOptions = async (req, res, next) => {
	const categories = await Category.find({});

	res.status(200).json({
		success: true,
		categories,
	});
};

exports.getCategoryOptions = asyncHandler(_getCategoryOptions);

/**
 * @description Get all categories
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getAllCategories = async (req, res, next) => {
	const { start, limit } = req;

	const categories = await Category.find({}).sort({ createdAt: 'desc' }).skip(start).limit(limit);
	const totalDocuments = await Category.estimatedDocumentCount();

	res.status(200).json({
		success: true,
		categories,
		totalDocuments,
	});
};

exports.getAllCategories = asyncHandler(_getAllCategories);

/**
 * @description Gets one category by id
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getCategoryById = async (req, res, next) => {
	const { categoryId } = req.params;

	const category = await Category.findById(categoryId);

	if (category) {
		res.status(200).json({
			success: true,
			category,
		});
	} else {
		next(new ErrorResponse(`Category with id ${categoryId} does not exist`, 400));
	}
};

exports.getCategoryById = asyncHandler(_getCategoryById);

/**
 * @description Gets all articles that match the queried category ids
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _getArticlesByCategoryQuery = async (req, res, next) => {
	const {
		start,
		limit,
		query: { categoryId },
	} = req;

	if (categoryId) {
		const articles = await Article.find({ category: { $in: categoryId } })
			.sort({ createdAt: 'desc' })
			.skip(start)
			.limit(limit);
		const totalDocuments = await Article.find({ category: { $in: categoryId } }).countDocuments();

		res.status(200).json({
			success: true,
			articles,
			totalDocuments,
		});
	} else {
		next(new ErrorResponse('Query parameter `categoryId` is required', 400));
	}
};

exports.getArticlesByCategoryQuery = asyncHandler(_getArticlesByCategoryQuery);

/**
 * @description Creates a new category
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _addCategory = async (req, res, next) => {
	const { name, description } = req.body;

	if (!name || !description) {
		next(new ErrorResponse('All fields are required', 400));
	}

	const newCategory = await Category.create({
		name,
		description,
	});

	res.status(201).json({
		success: true,
		category: newCategory,
	});
};

exports.addCategory = asyncHandler(_addCategory);

/**
 * @description Deletes a single category
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _deleteOneCategory = async (req, res, next) => {
	const { categoryId } = req.params;

	const validCategory = await Category.findById(categoryId);

	if (validCategory) {
		await validCategory.remove();
		res.status(200).json({
			success: true,
			message: 'Successfully deleted category',
		});
	} else {
		next(new ErrorResponse(`Category with id ${categoryId} does not exist`, 400));
	}
};

exports.deleteOneCategory = asyncHandler(_deleteOneCategory);

/**
 * @description Deletes multiple categories
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _deleteMultipleCategories = async (req, res, next) => {
	const { categoryId } = req.query;

	if (!categoryId) {
		next(new ErrorResponse('Query parameters are required', 400));
	}

	let incompleteIds = [...categoryId];

	for (let i = 0; i < categoryId.length; i++) {
		let validCategory = await Category.findById(categoryId[i]);

		if (validCategory) {
			await validCateogyr.remove();
			incompleteIds.shift();
			continue;
		} else {
			break;
		}
	}

	if (incompleteIds.length > 0) {
		res.status(400).json({
			success: false,
			message: 'One or more categories could not be deleted',
			incompleteIds,
		});
	} else {
		res.status(200).json({
			success: true,
			message: 'Successfully deleted categories',
		});
	}
};

exports.deleteMultipleCategories = asyncHandler(_deleteMultipleCategories);

/**
 * @description Updates a single category
 * @param {Request} res Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next Express next function
 */
const _updateCategory = async (req, res, next) => {
	const { categoryId } = req.params;
	const { name, description } = req.body;

	if (!name || !description) {
		next(new ErrorResponse('All fields are required', 400));
	}

	const updatedCategory = await Category.findByIdAndUpdate(
		categoryId,
		{
			$set: {
				name,
				description,
			},
		},
		{ new: true }
	);

	if (updatedCategory) {
		res.status(200).json({
			success: true,
			updatedCategory,
		});
	} else {
		next(new ErrorResponse(`Category with id ${categoryId} does not exist`, 400));
	}
};

exports.updateCategory = asyncHandler(_updateCategory);
