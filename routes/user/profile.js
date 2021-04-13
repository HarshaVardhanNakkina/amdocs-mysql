const express = require('express')
const bcrypt = require('bcrypt')

const pool = require('../../db')

const router = express.Router()

async function getUserByUsername(username) {
	const [results, fields] = await pool.execute(
		`
        SELECT username, password
        FROM user
        WHERE username = ?
        `,
		[username]
	)
	return { results, fields }
}

router.get('/:username', async function (req, res, next) {
	if (!req.session.loggedIn) {
		res.redirect('/user/login')
	}
	const { username } = req.params
	try {
		const { results, fields } = await getUserByUsername(username)
		if (!results.length) {
			res.redirect('/user/login')
			return
		}
		const sessionFlash = res.locals.sessionFlash ?? {}
		res.render('user/profile.html', {
			title: 'Profile',
			loggedIn: req.session.loggedIn ?? false,
			username,
			...sessionFlash
		})
	} catch (error) {
		console.error(error)
		next(err)
	}
})

router.post('/:username/update', async function (req, res, next) {
	const { new_username } = req.body
	const { username: old_username } = req.params
	if (old_username === new_username) {
		req.session.sessionFlash = {
			message: {
				type: 'success',
				text: 'Done, nothing changed'
			}
		}
		res.redirect(`/user/profile/${old_username}`)
	}

	const { results, _ } = await getUserByUsername(new_username)
	if (results.length) {
		req.session.sessionFlash = {
			new_username,
			old_username,
			message: {
				type: 'error',
				text: 'Username is not availble'
			}
		}
		res.redirect(`/user/profile/${old_username}`)
		return
	}
	try {
		await pool.execute(
			`
                UPDATE user
                SET username = ?
                WHERE username = ?
            `,
			[new_username, old_username]
		)
		req.session.sessionFlash = {
			message: {
				type: 'success',
				text: 'Username updated successfully'
			}
		}
		req.session.username = new_username
		res.redirect(`/user/profile/${new_username}`)
		return
	} catch (error) {
		console.error(error)
		next(error)
	}
})

router.post('/:username/change_password', async function (req, res, next) {
	const { cur_password, new_password } = req.body
	const { username } = req.params
	if (new_password.length == 0) {
		req.session.sessionFlash = {
			message: {
				form: 'password',
				type: 'success',
				text: 'Done, nothing changed'
			}
		}
		res.redirect(`/user/profile/${username}`)
		return
	} else {
		if (cur_password.length == 0) {
			req.session.sessionFlash = {
				message: {
					form: 'password',
					type: 'error',
					text: 'Current Password Required'
				}
			}
			res.redirect(`/user/profile/${username}`)
			return
		}
	}

	const { results, _ } = await getUserByUsername(username)
	try {
		const match = await bcrypt.compare(cur_password, results[0].password)
		if (!match) {
			req.session.sessionFlash = {
				message: {
					form: 'password',
					type: 'error',
					text: 'Wrong Password'
				}
			}
			res.redirect(`/user/profile/${username}`)
			return
		}
	} catch (error) {
		console.error(error)
		next(error)
	}
	try {
		const saltRounds = parseInt(process.env.SALT_ROUNDS) ?? 10
		const salt = await bcrypt.genSalt(saltRounds)
		const passwdHash = await bcrypt.hash(new_password, salt)
		await pool.execute(
			`
                UPDATE user
                SET password = ?
                WHERE username = ?
            `,
			[passwdHash, username]
		)
		req.session.sessionFlash = {
			message: {
				type: 'success',
				text: 'Password updated successfully'
			}
		}
		res.redirect('/user/logout')
	} catch (error) {
		console.error(error)
		next(error)
	}
})

module.exports = router
