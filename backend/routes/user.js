const router = require('express').Router()
const userValidations = require('../middlewares/user/userValidations')
const { userExtractor } = require('../middlewares/authMiddleware')
const limiter = require('../middlewares/limiter')
const suspensionGuard = require('../middlewares/user/suspensionGuard') 
const upload = require('../utils/multer')
const userController = require('../controllers/user')

// rutas publicas

router.post('/registro', limiter, upload.single('imagen'), userValidations, userController.crearUser)

router.post('/registro/:admin', limiter, upload.single('imagen'), userValidations, userController.crearUser)

// rutas privadas

router.use(userExtractor)

router.patch('/:id/suspender', suspensionGuard, userController.suspenderCuenta)

router.put('/editar', upload.single('imagen'), userValidations, userController.editarCuenta)

module.exports = router
