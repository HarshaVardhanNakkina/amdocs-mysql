var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('home.html', { name: 'Harsha', title: 'MySQL Assignment' })
})

module.exports = router
