const mongoose = require('mongoose');
const { getDateString, getRelativeDateString } = require('../utils/dateHelper');

const ArticleCommentSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true,
	},
	relatedArticle: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Article',
		required: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		autopopulate: true,
	},
	createdAt: {
		type: Date,
		default: function () {
			return new Date();
		},
	},
});

ArticleCommentSchema.plugin(require('mongoose-autopopulate'));

ArticleCommentSchema.set('toJSON', {
	transform: (doc, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		returnedObject.createdAt = getDateString(doc.createdAt);
		returnedObject.relativeTime = getRelativeDateString(doc.createdAt);

		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

const ArticleComment = mongoose.model('ArticleComment', ArticleCommentSchema);

module.exports = ArticleComment;
