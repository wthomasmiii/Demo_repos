const mongoose = require('mongoose');

const ArticleViewSchema = new mongoose.Schema({
	article: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Article',
		required: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	timestamp: {
		type: Date,
		default: function () {
			return new Date();
		},
	},
});

ArticleViewSchema.set('toJSON', {
	transform: (doc, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();

		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

const ArticleView = mongoose.model('ArticleView', ArticleViewSchema);

module.exports = ArticleView;
