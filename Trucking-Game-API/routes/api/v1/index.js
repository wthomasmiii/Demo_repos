const router = require('express').Router();

router.use('/articles', require('./articles'));
router.use('/categories', require('./categories'));
router.use('/tickets', require('./tickets'));
router.use('/metrics', require('./metrics'));
router.use('/users', require('./users'));
router.use('/auth', require('./authorization/auth'));
router.use('/simulatorInformation', require('./simulatorInformation'));
router.use('/payments', require('./payments'));
router.use('/docs', require('./docs'));

module.exports = router;
