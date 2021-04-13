const express = require('express')
const bcrypt = require('bcrypt')

const pool = require('../../db')

const router = express.Router()

router.get('/', async function (req, res, next) {
	const message = req.flash('message').length
		? {
				type: 'success',
				text: 'Signup successful, plase login'
		  }
		: null
	res.render('user/login.html', {
		message,
		title: 'Login',
		loggedIn: req.session.loggedIn,
		username: req.session.username
	})
})

router.post('/', async function (req, res, next) {
	const { username, password } = req.body
	try {
		const [results, fields] = await pool.execute(
			`
                SELECT username, password
                FROM user
                WHERE username = ?
            `,
			[username]
		)
		if (results.length == 0) {
			res.render('user/login.html', {
				user: req.body,
				message: {
					type: 'error',
					text: 'Check Credentials'
				},
				title: 'Login',
				loggedIn: req.session.loggedIn,
				username: req.session.username
			})
			return
		}
		const match = await bcrypt.compare(password, results[0].password)
		if (!match) {
			res.render('user/login.html', {
				user: req.body,
				message: {
					type: 'error',
					text: 'Check Credentials'
				},
				title: 'Login',
				loggedIn: req.session.loggedIn,
				username: req.session.username
			})
			return
		}
		req.session.loggedIn = true
		req.session.username = results[0].username
		res.redirect('/')
	} catch (error) {
		console.error(error)
		next(err)
	}
})

module.exports = router
