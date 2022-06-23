const mongoose = require('mongoose');

/**
 * @description Establishes connection to MongoDB database
 * @returns {Promise<String>} Db connected message
 */
const connect_db = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false,
		});
		console.log('DB Connected...');
	} catch (error) {
		console.warn(error);
	}
};

module.exports = connect_db;
