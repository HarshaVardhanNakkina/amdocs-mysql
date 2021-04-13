const express = require('express')
const router = express.Router()

const pool = require('../db')

/* GET home page. */
router.get('/', async function (req, res, next) {
	try {
		const [results, fields] = await pool.execute(
			`
            SELECT
                e.empid 'id', e.ename 'name', e.job 'job', e.sal 'salary', d.dname 'department'
            FROM
                employee e NATURAL JOIN dept d
            `
		)

		res.render('employees/index.html', {
			results,
			title: 'Employees List',
			loggedIn: req.session.loggedIn ?? false,
			username: req.session.username
		})
	} catch (error) {
		next(error)
	}
})

module.exports = router
