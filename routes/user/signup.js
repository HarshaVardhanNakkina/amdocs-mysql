const express = require('express')
const bcrypt = require('bcrypt')
const Joi = require('joi')

const pool = require('../../db')

const router = express.Router()

const userSchema = Joi.object({
	username: Joi.string().alphanum().required(),
	password: Joi.string().min(8).required(),
	confirm_password: Joi.string()
		.required()
		.valid(Joi.ref('password'))
		.prefs({
			messages: {
				'any.only': 'Passwords dont match'
			}
		})
})

router.get('/', async function (req, res, next) {
	res.render('user/signup.html', {
		title: 'Signup',
		loggedIn: req.session.loggedIn,
		username: req.session.username
	})
})

router.post('/', async function (req, res, next) {
	try {
		const value = await userSchema.validateAsync(req.body)
	} catch (err) {
		console.error(error)
		next(err)
	}
	const { username, password } = req.body
	const [results, fields] = await pool.execute(
		`
            SELECT *
            FROM user
            WHERE username = ?
            `,
		[username]
	)
	if (results.length) {
		res.render('user/signup.html', {
			user: req.body,
			message: {
				type: 'error',
				text: 'Username is not available'
			},
			title: 'Signup',
			loggedIn: req.session.loggedIn,
			username: req.session.username
		})
		return
	}

	try {
		const saltRounds = parseInt(process.env.SALT_ROUNDS) ?? 10
		const salt = await bcrypt.genSalt(saltRounds)
		const passwdHash = await bcrypt.hash(password, salt)
		await pool.execute(
			`
            INSERT INTO user(username, password)
            VALUES (?, ?)
            `,
			[username, passwdHash]
		)
	} catch (error) {
		console.error(error)
		next(error)
	}
	req.flash('message', 'Signup successful, please login')
	res.redirect('/user/login')
})

module.exports = router
