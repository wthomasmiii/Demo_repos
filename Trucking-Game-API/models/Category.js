const mongoose = require('mongoose');
const { getDateString, getRelativeDateString } = require('../utils/dateHelper');

const CategorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	description: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: function () {
			return new Date();
		},
	},
});

CategorySchema.set('toJSON', {
	transform: (doc, returnedObject) => {
		returnedObject.id = returnedObject._id.toString();
		returnedObject.createdAt = getDateString(doc.createdAt);

		delete returnedObject._id;
		delete returnedObject.__v;
	},
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
