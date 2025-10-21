const router = require('express').Router()
const userValidations = require('../middlewares/userValidations')
const { userExtractor } = require('../middlewares/authMiddleware')
const limiter = require('../middlewares/limiter')
const suspensionGuard = require('../middlewares/suspensionGuard') 
const upload = require('../utils/multer')
const userController = require('../controllers/user')


// limitador de llamadas

router.use(limiter)

router.post('/registro', upload.single('imagen'), userValidations, userController.crearUser)

router.post('/registro/:admin', upload.single('imagen'), userValidations, userController.crearUser)

// rutas privadas

router.use(userExtractor)

router.patch('/:id/suspender', suspensionGuard, userController.suspenderCuenta)

module.exports = router
