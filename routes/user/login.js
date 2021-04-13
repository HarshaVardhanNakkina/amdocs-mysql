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
		loggedIn: req.session.loggedIn
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
				type: 'error',
				text: 'User Not Found'
			})
		}
		const isPasswordValid = bcrypt.compare(password, results[0].password)
		if (!isPasswordValid) {
			res.render('user/login.html', {
				type: 'error',
				text: 'User Not Found'
			})
		}
		req.session.loggedIn = true
		req.session.username = results[0].username
		res.redirect('/')
	} catch (error) {
		console.error(error)
		res.render('user/login.html', {
			type: 'error',
			text: 'Internal Server Error, Try again'
		})
	}
})

module.exports = router
