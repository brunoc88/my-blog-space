const router = require('express').Router()
const userValidations = require('../middlewares/userValidations')
const upload = require('../utils/multer')
const userController = require('../controllers/user')


router.post('/registro', upload.single('imagen'), userValidations, userController.crearUser)

router.post('/registro/:admin', upload.single('imagen'), userValidations, userController.crearUser)


module.exports = router
