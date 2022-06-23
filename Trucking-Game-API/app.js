const express = require('express');
const connect_db = require('./utils/connect_db');
const errorHandler = require('./middleware/error');
const requestLogger = require('./middleware/requestLogger');
const bodyParser = require("body-parser");
const cors = require('cors');
const path = require("path");
require('dotenv').config({ path: './.env' });

app = express();

//Routes
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Credentials", "true");
  
	res.setHeader(
	  "Access-Control-Allow-Headers",
	  "Access-Control-Allow-Headers, Origin,Accept, Authorization, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
	);
	res.setHeader(
	  "Access-Control-Allow-Methods",
	  "GET, POST, PATCH, PUT, DELETE, OPTIONS"
	);
	next();
  });
  app.use(bodyParser.urlencoded());
  
  app.use(bodyParser.json());
  app.use(cors());
  app.options("*", cors());
connect_db();

app.use((req, res, next) => {
	if (req.originalUrl === '/api/v1/payments/webhooks') {
		next();
	} else {
		express.json()(req, res, next);
	}
});
app.use(requestLogger);
app.get("/", function (req, res) {
	res.sendFile(path.join(__dirname + "/views/index.html"));
	res.status(200).send("works");
  });
app.use('/', require('./routes'));

app.use(errorHandler);

app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`));
