const mongoose = require('mongoose');
const generateSlug = require('./utils/generateSlug');
const date = require('date-fns');
const connect_db = require('./utils/connect_db');
const bcrypt = require('bcryptjs');
const faker = require('faker');
require('./models/User');
require('dotenv').config({ path: './.env' });

// Counter Class
class Counter {
	constructor() {
		this.ticketNumber = 1;
		this.categoryNumber = 1;
		this.emailNumber = 1;
	}

	incrementTicketNumber() {
		this.ticketNumber++;
	}
	incrementCategoryNumber() {
		this.categoryNumber++;
	}
	incrementEmailNumber() {
		this.emailNumber++;
	}
}

// Placeholder variables
let articleTitle = 'Test Article';
let articleText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Hendrerit dolor magna eget est. Amet facilisis magna etiam tempor orci eu lobortis elementum. Ut tortor pretium viverra suspendisse potenti nullam ac. Feugiat vivamus at augue eget. Volutpat est velit egestas dui id ornare arcu. Lectus quam id leo in vitae turpis massa. Id cursus metus aliquam eleifend mi. Consequat interdum varius sit amet mattis vulputate enim nulla. Et tortor consequat id porta nibh venenatis cras. Quis enim lobortis scelerisque fermentum dui.
Ipsum dolor sit amet consectetur adipiscing elit. Nunc non blandit massa enim nec. Consequat ac felis donec et odio pellentesque diam. Lectus arcu bibendum at varius. Aliquet sagittis id consectetur purus. Volutpat blandit aliquam etiam erat velit scelerisque in dictum non. Sed augue lacus viverra vitae. Auctor eu augue ut lectus arcu bibendum. Viverra suspendisse potenti nullam ac tortor. A lacus vestibulum sed arcu. Aliquam vestibulum morbi blandit cursus risus at ultrices mi. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus. Felis eget velit aliquet sagittis id consectetur. Lorem ipsum dolor sit amet consectetur adipiscing elit duis.
Suspendisse interdum consectetur libero id faucibus nisl tincidunt. Est ullamcorper eget nulla facilisi etiam dignissim diam quis enim. Sed cras ornare arcu dui vivamus arcu felis bibendum. Lacus luctus accumsan tortor posuere ac ut consequat. Nunc sed velit dignissim sodales ut eu. In vitae turpis massa sed elementum tempus. Orci phasellus egestas tellus rutrum. Interdum velit laoreet id donec ultrices. Tortor condimentum lacinia quis vel eros donec. Quis ipsum suspendisse ultrices gravida dictum. Dignissim diam quis enim lobortis scelerisque. Felis eget velit aliquet sagittis id consectetur purus ut. Massa sapien faucibus et molestie ac feugiat sed lectus vestibulum. Sagittis nisl rhoncus mattis rhoncus urna neque viverra. Sit amet commodo nulla facilisi nullam vehicula. Facilisi nullam vehicula ipsum a arcu cursus vitae congue. Dui faucibus in ornare quam viverra orci sagittis eu. Nulla aliquet porttitor lacus luctus.
Imperdiet dui accumsan sit amet nulla. Hendrerit gravida rutrum quisque non. Placerat orci nulla pellentesque dignissim enim. Cursus turpis massa tincidunt dui ut ornare lectus sit. Diam ut venenatis tellus in metus vulputate eu. Ut diam quam nulla porttitor. Nunc sed blandit libero volutpat. Vestibulum morbi blandit cursus risus at. Convallis aenean et tortor at risus viverra adipiscing. Eu feugiat pretium nibh ipsum consequat nisl. A diam maecenas sed enim. Feugiat in ante metus dictum at tempor.
Consequat ac felis donec et. Feugiat nisl pretium fusce id velit ut tortor. Diam quam nulla porttitor massa id neque aliquam vestibulum morbi. Bibendum arcu vitae elementum curabitur. Et netus et malesuada fames ac turpis egestas sed. Senectus et netus et malesuada fames ac turpis. Libero nunc consequat interdum varius. Adipiscing tristique risus nec feugiat in fermentum posuere urna. Sapien nec sagittis aliquam malesuada bibendum arcu vitae elementum curabitur. In nibh mauris cursus mattis molestie a iaculis. Cras adipiscing enim eu turpis. Sit amet nisl suscipit adipiscing bibendum est.`;
let articleHtml = `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Hendrerit dolor magna eget est. Amet facilisis magna etiam tempor orci eu lobortis elementum. Ut tortor pretium viverra suspendisse potenti nullam ac. Feugiat vivamus at augue eget. Volutpat est velit egestas dui id ornare arcu. Lectus quam id leo in vitae turpis massa. Id cursus metus aliquam eleifend mi. Consequat interdum varius sit amet mattis vulputate enim nulla. Et tortor consequat id porta nibh venenatis cras. Quis enim lobortis scelerisque fermentum dui.
Ipsum dolor sit amet consectetur adipiscing elit. Nunc non blandit massa enim nec. Consequat ac felis donec et odio pellentesque diam. Lectus arcu bibendum at varius. Aliquet sagittis id consectetur purus. Volutpat blandit aliquam etiam erat velit scelerisque in dictum non. Sed augue lacus viverra vitae. Auctor eu augue ut lectus arcu bibendum. Viverra suspendisse potenti nullam ac tortor. A lacus vestibulum sed arcu. Aliquam vestibulum morbi blandit cursus risus at ultrices mi. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla phasellus. Felis eget velit aliquet sagittis id consectetur. Lorem ipsum dolor sit amet consectetur adipiscing elit duis.
Suspendisse interdum consectetur libero id faucibus nisl tincidunt. Est ullamcorper eget nulla facilisi etiam dignissim diam quis enim. Sed cras ornare arcu dui vivamus arcu felis bibendum. Lacus luctus accumsan tortor posuere ac ut consequat. Nunc sed velit dignissim sodales ut eu. In vitae turpis massa sed elementum tempus. Orci phasellus egestas tellus rutrum. Interdum velit laoreet id donec ultrices. Tortor condimentum lacinia quis vel eros donec. Quis ipsum suspendisse ultrices gravida dictum. Dignissim diam quis enim lobortis scelerisque. Felis eget velit aliquet sagittis id consectetur purus ut. Massa sapien faucibus et molestie ac feugiat sed lectus vestibulum. Sagittis nisl rhoncus mattis rhoncus urna neque viverra. Sit amet commodo nulla facilisi nullam vehicula. Facilisi nullam vehicula ipsum a arcu cursus vitae congue. Dui faucibus in ornare quam viverra orci sagittis eu. Nulla aliquet porttitor lacus luctus.
Imperdiet dui accumsan sit amet nulla. Hendrerit gravida rutrum quisque non. Placerat orci nulla pellentesque dignissim enim. Cursus turpis massa tincidunt dui ut ornare lectus sit. Diam ut venenatis tellus in metus vulputate eu. Ut diam quam nulla porttitor. Nunc sed blandit libero volutpat. Vestibulum morbi blandit cursus risus at. Convallis aenean et tortor at risus viverra adipiscing. Eu feugiat pretium nibh ipsum consequat nisl. A diam maecenas sed enim. Feugiat in ante metus dictum at tempor.
Consequat ac felis donec et. Feugiat nisl pretium fusce id velit ut tortor. Diam quam nulla porttitor massa id neque aliquam vestibulum morbi. Bibendum arcu vitae elementum curabitur. Et netus et malesuada fames ac turpis egestas sed. Senectus et netus et malesuada fames ac turpis. Libero nunc consequat interdum varius. Adipiscing tristique risus nec feugiat in fermentum posuere urna. Sapien nec sagittis aliquam malesuada bibendum arcu vitae elementum curabitur. In nibh mauris cursus mattis molestie a iaculis. Cras adipiscing enim eu turpis. Sit amet nisl suscipit adipiscing bibendum est.</p>`;
let ticketEmail = 'xyz@email.com';

// Id arrays
let categoryIds = [];
let articleIds = [];
let adminIds = [];
let userIds = [];
let userEmails = [];
let ticketIds = [];

// Placeholder arrays
let lastWeekDate = date.subWeeks(new Date(), 1);
let lastMonthDate = date.subMonths(new Date(), 1);
let lastDayDate = date.subHours(new Date(), Math.floor(Math.random() * 21));
let customRangeDate = date.subMonths(new Date(), 3); // January

let ticketCategories = ['payments', 'articles', 'bug'];
let dates = [lastWeekDate, lastDayDate, lastMonthDate, customRangeDate];

// Random Number generators for various models
class Random {
	constructor() {
		this.randomNumber = 0;
	}

	randomCategory() {
		this.randomNumber = Math.floor(Math.random() * categoryIds.length);

		return categoryIds[this.randomNumber];
	}
	randomDate() {
		this.randomNumber = Math.floor(Math.random() * dates.length);

		return dates[this.randomNumber];
	}
	randomArticle() {
		this.randomNumber = Math.floor(Math.random() * articleIds.length);

		return articleIds[this.randomNumber];
	}
	randomAdmin() {
		this.randomNumber = Math.floor(Math.random() * adminIds.length);

		return adminIds[this.randomNumber];
	}
	randomUser() {
		this.randomNumber = Math.floor(Math.random() * userIds.length);

		return userIds[this.randomNumber];
	}
	randomUserOrAdmin() {
		const allUsers = userIds.concat(adminIds);
		this.randomNumber = Math.floor(Math.random() * allUsers.length);

		return allUsers[this.randomNumber];
	}
	randomTicketCategory() {
		this.randomNumber = Math.floor(Math.random() * ticketCategories.length);

		return ticketCategories[this.randomNumber];
	}
	randomTicket() {
		this.randomNumber = Math.floor(Math.random() * ticketIds.length);

		return ticketIds[this.randomNumber];
	}
	randomPhoneNumber() {
		const firstThree = Math.ceil(Math.random() * 999);
		const secondThree = Math.ceil(Math.random() * 999);
		const lastFour = Math.ceil(Math.random() * 9999);

		return `${firstThree}-${secondThree}-${lastFour}`;
	}
	randomUserRole() {
		const roles = [3, 4];
		this.randomNumber = Math.floor(Math.random() * 2);

		return roles[this.randomNumber];
	}
	randomBoolean() {
		return Math.floor(Math.random() * 2) === 0 ? false : true;
	}
	randomUserEmail() {
		this.randomNumber = Math.floor(Math.random() * userEmails.length);

		return userEmails[this.randomNumber];
	}
}

const random = new Random();
const counter = new Counter();

const users = [
	{
		name: 'Morgan Moreno',
		password: '1234',
		email: 'admin@test.com',
		phone: '123-456-7890',
		role: 2,
		profileImage: faker.image.avatar(),
	},
	{
		name: 'Tom Hanks',
		password: '1234',
		email: 'admin2@test.com',
		phone: '132-465-0897',
		role: 2,
		profileImage: faker.image.avatar(),
	},
	{
		name: 'Testing Test',
		password: 'password12',
		email: 'morgan@email.com',
		phone: '124-532-9867',
		role: 1,
		profileImage: faker.image.avatar(),
	},
];

const main = async () => {
	try {
		await connect_db();

		const db = mongoose.connection.db;

		await db.dropDatabase();

		for (let i = 0; i < users.length; i++) {
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(users[i].password, salt);

			const result = await db.collection('users').insertOne({ ...users[i], password: hash });
			adminIds.push(result.ops[0]['_id']);
		}

		for (let i = 0; i < 500; i++) {
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash('1234', salt);

			const role = random.randomUserRole();

			const user = {
				name: `${faker.name.firstName()} ${faker.name.lastName()}`,
				password: hash,
				email: faker.internet.email(),
				phone: faker.phone.phoneNumber(),
				profileImage: faker.image.avatar(),
				role,
				hasPaid: role === 3 ? true : false,
			};

			const result = await db.collection('users').insertOne(user);
			userIds.push(result.ops[0]['_id']);
			userEmails.push(result.ops[0]['email']);
			counter.incrementEmailNumber();
		}

		for (let i = 0; i < 25; i++) {
			const result = await db.collection('categories').insertOne({
				description: faker.commerce.productDescription(),
				name: faker.commerce.productAdjective(),
			});
			counter.incrementCategoryNumber();
			categoryIds.push(result.ops[0]['_id']);
		}

		for (let i = 0; i < 1000; i++) {
			const articleText = faker.lorem.paragraphs(10);
			const html = `<p>${articleText}</p>`;

			let article = {
				title: faker.lorem.sentence(),
				textBody: articleText,
				htmlBody: html,
				tags: [faker.commerce.color(), faker.commerce.color(), faker.commerce.color()],
				isFree: random.randomBoolean(),
			};

			const slug = await generateSlug(article.title);
			const category = random.randomCategory();
			const authorId = random.randomAdmin();

			const result = await db
				.collection('articles')
				.insertOne({ ...article, slug, category, author: authorId });
			articleIds.push(result.ops[0]['_id']);
		}

		for (let i = 0; i < 2000; i++) {
			let comment = {
				text: faker.lorem.paragraph(),
				user: random.randomUserOrAdmin(),
				createdAt: random.randomDate(),
				relatedArticle: random.randomArticle(),
			};
			await db.collection('articlecomments').insertOne(comment);
		}

		for (let i = 0; i < 5000; i++) {
			let articleView = {
				article: random.randomArticle(),
				user: random.randomUser(),
				timestamp: random.randomDate(),
			};

			await db.collection('articleviews').insertOne(articleView);
		}

		// Create assigned tickets
		for (let i = 0; i < 450; i++) {
			let ticket = {
				status: faker.datatype.number({ min: 0, max: 4 }),
				assignedTo: random.randomAdmin(),
				ticketNumber: counter.ticketNumber,
				createdBy: random.randomUserEmail(),
				message: faker.lorem.sentences(5),
				category: random.randomTicketCategory(),
				createdAt: random.randomDate(),
			};

			const result = await db.collection('tickets').insertOne(ticket);
			ticketIds.push(result.ops[0]['_id']);
			counter.incrementTicketNumber();
		}

		// Create unassigned tickets
		for (let i = 0; i < 50; i++) {
			let ticket = {
				status: faker.datatype.number({ min: 0, max: 4 }),
				ticketNumber: counter.ticketNumber,
				createdBy: random.randomUserEmail(),
				message: faker.lorem.sentences(5),
				category: random.randomTicketCategory(),
				createdAt: random.randomDate(),
			};

			const result = await db.collection('tickets').insertOne(ticket);
			ticketIds.push(result.ops[0]['_id']);
			counter.incrementTicketNumber();
		}

		// Create ticket messages
		for (let i = 0; i < 1000; i++) {
			let relatedTicket = random.randomTicket();

			let ticketComment = {
				text: faker.lorem.sentences(3),
				relatedTicket,
				user: random.randomUserOrAdmin(),
				createdAt: random.randomDate(),
			};

			await db.collection('ticketmessages').insertOne(ticketComment);
		}

		console.log('Data successfully added');

		mongoose.connection.close();
		process.exit(0);
	} catch (error) {
		console.log(error);
	}
};

main();
