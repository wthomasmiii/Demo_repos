const { format, formatDistanceToNow, getMonth, getYear, getDate } = require('date-fns');

const MonthLookup = {
	0: 'Jan',
	1: 'Feb',
	2: 'Mar',
	3: 'Apr',
	4: 'May',
	5: 'Jun',
	6: 'Jul',
	7: 'Aug',
	8: 'Sep',
	9: 'Oct',
	10: 'Nov',
	11: 'Dec',
};

/**
 * @description Generates a user friendly date string from a documents date field
 * @param {String} str
 * @returns {String}
 */
const getDateString = str => {
	const date = new Date(str);

	const month = MonthLookup[getMonth(date)];
	const day = getDate(date);
	const year = getYear(date);

	const time = format(date, 'HH:mm aaa');

	return `${month} ${day}, ${year} at ${time}`;
};

/**
 * @description Generates a user friendly date string for the passed in date relative to now
 * @param {String} str
 * @returns {String}
 */
const getRelativeDateString = str => {
	return formatDistanceToNow(new Date(str), { addSuffix: true });
};

module.exports = {
	getDateString,
	getRelativeDateString,
};
