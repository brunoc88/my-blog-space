const router = require('express').Router()
const userValidations = require('../middlewares/user/userValidations')
const { userExtractor } = require('../middlewares/authMiddleware')
const limiter = require('../middlewares/limiter')
const suspensionGuard = require('../middlewares/user/suspensionGuard') 
const recoveryPasswordValidations = require('../middlewares/user/recoveryPasswordValidations')
const recoveryPasswordGuard = require('../middlewares/user/recoveryPasswordGuard')
const verifyBlock = require('../middlewares/verifyBlock')
const verifyFollowing = require('../middlewares/user/verifyFollowing')
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

router.patch('/estado', userController.estado)

router.patch('/seguir/:id', verifyBlock, verifyFollowing, userController.seguir)

// provisional: falta populate
router.get('/miPerfil', userController.miPerfil)

router.get('/perfil/:id', verifyBlock, userController.perfil)

module.exports = router
