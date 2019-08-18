const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const status = require('http-status');
const validateReq = require('../middlewares/validate-req');
const userModel = require('../models/user');
const passport = require('passport');
// const mustAuth = require('../middlewares/must-auth');
router.post('/login', function(req, res, next) {
	passport.authenticate('local', (err, user, info) => {
		if (err) {
			return next(err);
		}
		if (!user) {
			return res.status(403).send({ message: 'Đăng nhập thất bại' });
		}
		req.logIn(user, function(err) {
			if (err) {
				return res.status(403).send({ message: 'Đăng nhập thất bại' });
			}
			res.send({ username: user.username, fullName: user.fullName, avatar: user.avatar });
		});
	})(req, res, next);
});
router.post(
	'/logon',
	[
		body('username').isString(),
		body('fullName').isString(),
		body('password')
			.isString()
			.isLength({ min: 6, max: 20 }),
		validateReq,
	],
	async (req, res) => {
		const { username, password, fullName } = req.body;
		const user = await userModel.findOne({ username });
		if (user) {
			return res.status(status.FORBIDDEN).send({ message: 'Tài khoản đã tồn tại ' });
		}
		const hashPassword = userModel.hashPassword(password);
		await userModel.create({ username, hashPassword, fullName });
		return res.send({ message: 'Đăng kí thành công ' });
	},
);

module.exports = router;
