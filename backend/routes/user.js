const router = require('express').Router()
const userValidations = require('../middlewares/user/userValidations')
const { userExtractor } = require('../middlewares/authMiddleware')
const limiter = require('../middlewares/limiter')
const suspensionGuard = require('../middlewares/user/suspensionGuard')
const recoveryPasswordValidations = require('../middlewares/user/recoveryPasswordValidations')
const recoveryPasswordGuard = require('../middlewares/user/recoveryPasswordGuard')
const verifyBlock = require('../middlewares/verifyBlock')
const verifyBlockPermissions = require('../middlewares/user/verifyBlockPermissions')
const verifyFollowing = require('../middlewares/user/verifyFollowing')
const verifyAction = require('../middlewares/user/verifyAction')
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

router.patch('/bloquear/:id', verifyBlock, verifyBlockPermissions, userController.bloquear)

router.patch('/desbloquear/:id', verifyAction('bloqueo'), userController.desbloquear)

router.patch('/seguir/:id', verifyBlock, verifyFollowing, userController.seguir)

router.patch('/noSeguir/:id', verifyAction('seguimiento'), userController.dejarDeSeguir)

router.patch('/solicitud/aceptar/:id', verifyBlock, verifyAction('solicitud'), userController.aceptarSolicitud)

router.patch('/solicitud/rechazar/:id', verifyAction('solicitud'), userController.rechazarSolicitud)

router.get('/bloqueados', userController.listaDeBloqueados)

router.get('/solicitudes', userController.listaDeSolicitudes)

router.get('/seguidos', userController.listaDeSeguidos)

router.get('/seguidores', userController.listaDeSeguidores)

router.get('/miPerfil', userController.perfil)

router.get('/:id/perfil', verifyBlock, userController.perfil)

module.exports = router
