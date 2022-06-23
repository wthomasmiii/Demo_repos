const mongoose = require('mongoose');
const Category = require('./Category');
const ArticleComment = require('./ArticleComment');
const { getDateString } = require('../utils/dateHelper');

const ArticleSchema = new mongoose.Schema({
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		autopopulate: true,
	},
	slug: {
		type: String,
		required: true,
		unique: true,
	},
	title: {
		type: String,
		required: true,
	},
	htmlBody: {
		type: String,
		required: true,
	},
	textBody: {
		type: String,
		required: true,
	},
	tags: [
		{
			type: String,
		},
	],
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'ArticleComment',
			autopopulate: true,
		},
	],
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category',
		required: true,
		autopopulate: true,
	},
	isFree: {
		type: Boolean,
		required: true,
	},
	editingLocked: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: function () {
			return new Date();
		},
	},
});

ArticleSchema.plugin(require('mongoose-autopopulate'));
ArticleSchema.post('remove', async function (doc, next) {
	try {
		let category = await Category.findById(doc.category._id);

		await category.updateOne({
			$set: {
				numberOfArticles: category.numberOfArticles - 1,
			},
		});

		await ArticleComment.deleteMany({ relatedArticle: doc._id });
		next();
	} catch (error) {
		next(error);
	}
});

ArticleSchema.set('toJSON', {
	transform: (doc, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		returnedObject.createdAt = getDateString(doc.createdAt);

		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

ArticleSchema.methods.toggleEditingLocked = async function () {
	this.editingLocked = !this.editingLocked;
	await this.save();
};

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;
