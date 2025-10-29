const router = require('express').Router()
const userValidations = require('../middlewares/user/userValidations')
const { userExtractor } = require('../middlewares/authMiddleware')
const limiter = require('../middlewares/limiter')
const suspensionGuard = require('../middlewares/user/suspensionGuard') 
const recoveryPasswordValidations = require('../middlewares/user/recoveryPasswordGuard')
const recoveryPasswordGuard = require('../middlewares/user/recoveryPasswordGuard')
const upload = require('../utils/multer')
const userController = require('../controllers/user')

// rutas publicas

router.post('/registro', limiter, upload.single('imagen'), userValidations, userController.crearUser)

router.post('/registro/:admin', limiter, upload.single('imagen'), userValidations, userController.crearUser)

router.post('/recuperar-password', limiter, recoveryPasswordValidations, recoveryPasswordGuard, userController.recuperarPassword)

// rutas privadas

router.use(userExtractor)

router.patch('/:id/suspender', suspensionGuard, userController.suspenderCuenta)

router.put('/editar', upload.single('imagen'), userValidations, userController.editarCuenta)

module.exports = router
