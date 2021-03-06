const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.send({ title: 'Express' });
});
router.use('/user', require('./user'));
router.use('/room', require('./room'));
router.use('/message', require('./message'));
router.use('/file', require('./file'));
router.use('/group', require('./group'));
module.exports = router;
