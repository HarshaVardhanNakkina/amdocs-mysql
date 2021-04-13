const express = require('express')
const router = express.Router()

const loginRouter = require('./login')
const signupRouter = require('./signup')
const logoutRouter = require('./logout')

router.use('/login', loginRouter)
router.use('/signup', signupRouter)
router.use('/logout', logoutRouter)

module.exports = router
