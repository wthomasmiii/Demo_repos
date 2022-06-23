const router = require('express').Router();

router.use('/tickets', require('./tickets'));
router.use('/comments', require('./comments'));
router.use('/articleViews', require('./articleViews'));
router.use('/interactions', require('./interactions'));

module.exports = router;
