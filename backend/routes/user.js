const router = require('express').Router()
const userValidations = require('../middlewares/userValidations')
const { userExtractor } = require('../middlewares/authMiddleware')
const limiter = require('../middlewares/limiter')
const suspensionGuard = require('../middlewares/suspensionGuard') 
const upload = require('../utils/multer')
const userController = require('../controllers/user')

// rutas publicas

router.post('/registro', limiter, upload.single('imagen'), userValidations, userController.crearUser)

router.post('/registro/:admin', limiter, upload.single('imagen'), userValidations, userController.crearUser)

// rutas privadas

router.use(userExtractor)

router.patch('/:id/suspender', suspensionGuard, userController.suspenderCuenta)

module.exports = router
