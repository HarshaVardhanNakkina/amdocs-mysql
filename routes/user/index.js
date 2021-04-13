const express = require('express')
const router = express.Router()

const loginRouter = require('./login')
const signupRouter = require('./signup')
const logoutRouter = require('./logout')
const profileRouter = require('./profile')

router.use('/login', loginRouter)
router.use('/signup', signupRouter)
router.use('/logout', logoutRouter)
router.use('/profile', profileRouter)

module.exports = router
