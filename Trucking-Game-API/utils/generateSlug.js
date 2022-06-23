const Article = require('../models/Article');
require('../models/User');
/**
 * @description Creates a valid URL slug
 * @param {String} str
 * @returns {Promise<String>} Slugified version of str
 */
const generateSlug = async str => {
	try {
		/** For reference on this regex: https://lucidar.me/en/web-dev/how-to-slugify-a-string-in-javascript/ */
		str = str.replace(/^\s+|\s+$/g, '');

		str = str.toLowerCase();

		let from =
			'ÁÄÂÀÃÅČÇĆĎÉĚËÈÊẼĔȆÍÌÎÏŇÑÓÖÒÔÕØŘŔŠŤÚŮÜÙÛÝŸŽáäâàãåčçćďéěëèêẽĕȇíìîïňñóöòôõøðřŕšťúůüùûýÿžþÞĐđßÆa·/_,:;';
		let to =
			'AAAAAACCCDEEEEEEEEIIIINNOOOOOORRSTUUUUUYYZaaaaaacccdeeeeeeeeiiiinnooooooorrstuuuuuyyzbBDdBAa------';

		for (let i = 0; i < from.length; i++) {
			str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
		}

		str = str
			.replace(/[^a-z0-9 -]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');

		/** Logic to ensure that a unique slug is created */
		const slugExists = await Article.find({ slug: { $regex: str, $options: 'i' } }).lean();

		if (slugExists.length > 0) {
			const v = slugExists.length;

			str = str.concat(`-${v + 1}`);
			return str;
		} else {
			return str;
		}
	} catch (error) {
		console.log(error);
		return error;
	}
};

module.exports = generateSlug;
