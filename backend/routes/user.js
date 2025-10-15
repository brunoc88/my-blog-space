const router = require('express').Router()
const userValidations = require('../middlewares/userValidations')
const userController = require('../controllers/user')

router.post('/registro', userValidations, userController.crearUser)


module.exports = router
