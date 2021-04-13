const express = require('express')
const session = require('express-session')
const flash = require('connect-flash')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const compression = require('compression')
const helmet = require('helmet')
const eta = require('eta')

require('./db')

const indexRouter = require('./routes/index')
const employeesRouter = require('./routes/employees/index')
const userRouter = require('./routes/user/index')

const env = process.env.NODE_ENV ?? 'development'

const app = express()
app.engine('html', eta.renderFile)
app.set('views', './views')

if (env === 'production') app.use(helmet())
app.use(
	session({
		secret: process.env.SESSION_SECRET ?? 'hymn for the weekend',
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24
		}
	})
)
app.use(function (req, res, next) {
	res.locals.sessionFlash = req.session.sessionFlash
	delete req.session.sessionFlash
	next()
})
app.use(flash())
app.use(compression())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/employees', employeesRouter)
app.use('/user', userRouter)

module.exports = app
