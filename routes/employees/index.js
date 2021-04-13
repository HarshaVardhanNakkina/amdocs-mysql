const express = require('express')
const router = express.Router()

const pool = require('../../db')

async function getEmployeeById(id) {
	try {
		const [results, fields] = await pool.execute(
			`
            SELECT ename 'name', job 'job', sal 'sal', deptid 'deptid'
            FROM employee
            WHERE empid = ?
            `,
			[id]
		)
		return { err: null, results, fields }
	} catch (err) {
		return { err, results: null, fields: null }
	}
}

async function getDepartments() {
	try {
		const [results, fields] = await pool.execute(
			`
            SELECT
                deptid, dname
            FROM
                dept
            `
		)
		return { err: null, results, fields }
	} catch (err) {
		return { err, results: null, fields: null }
	}
}

/* GET employees list. */
/* router.get('/', async function (req, res, next) {
	try {
		const [results, fields] = await pool.execute(
			`
            SELECT
                e.empid 'id', e.ename 'name', e.job 'job', e.sal 'salary', d.dname 'department'
            FROM
                employee e NATURAL JOIN dept d
            `
		)

		res.render('employees/index.html', { results, title: 'Employees List' })
	} catch (error) {
		next(error)
	}
}) */

router.get('/add', async function (req, res, next) {
	try {
		const { err, results: departments, fields } = await getDepartments()
		res.render('employees/add_employee.html', { departments, title: 'Add Employee', loggedIn: req.session.loggedIn })
	} catch (error) {
		next(error)
	}
})

router.post('/add', async function (req, res, next) {
	const { ename, job, sal, dept: deptid } = req.body
	try {
		const [results, fields] = await pool.execute(
			`
            INSERT INTO employee (ename, job, sal, deptid)
            VALUES (?, ?, ?, ?)
            `,
			[ename, job, sal, deptid]
		)

		res.redirect('/employees')
	} catch (error) {
		next(error)
	}
})

router.get('/edit/:id', async function (req, res, next) {
	const { id } = req.params
	const emp = await getEmployeeById(id)
	if (emp.err) next(emp.err)

	const deps = await getDepartments()
	if (deps.err) next(deps.err)

	res.render('employees/edit_employee.html', {
		id,
		emp: emp.results[0],
		departments: deps.results,
		title: 'Update Employee',
		loggedIn: req.session.loggedIn
	})
})

router.post('/edit/:id', async function (req, res, next) {
	const { id } = req.params
	const { ename, job, sal, dept: deptid } = req.body
	try {
		await pool.execute(
			`
            UPDATE employee
            SET
                ename = ?,
                job = ?,
                sal = ?,
                deptid = ?
            WHERE empid = ?
            `,
			[ename, job, sal, deptid, id]
		)

		res.redirect('/employees')
	} catch (error) {
		next(error)
	}
})

router.get('/dept_10_sal_5000', async function (req, res, next) {
	try {
		const [results, fields] = await pool.execute(
			`
            SELECT empid 'id', ename 'name', job, sal 'salary', deptid, dname 'department'
            FROM employee NATURAL JOIN dept
            WHERE deptid = 10 AND sal < 5000
            `
		)

		res.render('employees/index.html', { results, title: 'Employees List', loggedIn: req.session.loggedIn })
	} catch (error) {
		next(error)
	}
})

module.exports = router
