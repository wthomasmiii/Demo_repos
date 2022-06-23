const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('../../../swagger.json');

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocs));

module.exports = router;
