const router = require('express').Router()
const loginValidation = require('../middlewares/loginValidation')
const loginController = require('../controllers/login')

router.post('/login', loginValidation, loginController.login)

module.exports = router