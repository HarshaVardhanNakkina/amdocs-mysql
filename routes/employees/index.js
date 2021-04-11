const express = require('express')
const router = express.Router()

const pool = require('../../db')

/* GET employees list. */
router.get('/', function (req, res, next) {
	pool.execute(
		`
        SELECT
            e.ename 'name', e.job 'job', e.sal 'salary', d.dname 'department'
        FROM
            employee e NATURAL JOIN dept d
        `,
		function (err, results, fields) {
			if (err) {
				console.error(err)
				return
			}
			res.render('employees/index.html', { results })
		}
	)
})

router.get('/add', function (req, res, next) {
	console.log(req.body)
	pool.execute(
		`
        SELECT
            deptid, dname
        FROM
            dept
        `,
		function (err, departments, fields) {
			if (err) {
				console.error(err)
				return
			}
			res.render('employees/add_employee.html', { departments })
		}
	)
})

router.post('/add', function (req, res, next) {
	const { ename, job, sal, dept: deptid } = req.body
	pool.execute(
		`
        INSERT INTO employee (ename, job, sal, deptid)
        VALUES (?, ?, ?, ?)
	    `,
		[ename, job, sal, deptid],
		function (err, results, fields) {
			if (err) {
				console.error(err)
				return
			}
		}
	)
	res.redirect('/employees')
})

module.exports = router
