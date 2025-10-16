const router = require('express').Router()
const loginValidation = require('../middlewares/loginValidation')
const limiter = require('../middlewares/limiter')
const loginController = require('../controllers/login')

router.post('/login', limiter, loginValidation, loginController.login)

module.exports = router