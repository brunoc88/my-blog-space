const router = require('express').Router()
const userValidations = require('../middlewares/userValidations')
const limiter = require('../middlewares/limiter')
const upload = require('../utils/multer')
const userController = require('../controllers/user')

router.use(limiter)

router.post('/registro', upload.single('imagen'), userValidations, userController.crearUser)

router.post('/registro/:admin', upload.single('imagen'), userValidations, userController.crearUser)


module.exports = router
