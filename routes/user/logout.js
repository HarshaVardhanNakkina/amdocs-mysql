const express = require('express')

const router = express.Router()

router.get('/', async function (req, res, next) {
	req.session.destroy(err => {
		console.error(err)
	})
	res.redirect('/')
})

module.exports = router
