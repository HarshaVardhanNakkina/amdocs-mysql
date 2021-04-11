const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const compression = require('compression')
const helmet = require('helmet')
const eta = require('eta')

require('./db')

const indexRouter = require('./routes/index')
const employeesRouter = require('./routes/employees/index')

const app = express()
app.engine('html', eta.renderFile)
app.set('views', './views')

app.use(helmet())
app.use(compression())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/employees', employeesRouter)

module.exports = app
