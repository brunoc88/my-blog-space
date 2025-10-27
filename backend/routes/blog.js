const router = require('express').Router()
const upload = require('../utils/multer')
const blogValidations = require('../middlewares/blog/blogValidations')
const blogPermissions = require('../middlewares/blog/blogPermissions')
const { userExtractor } = require('../middlewares/authMiddleware')
const blogController = require('../controllers/blog')


router.use(userExtractor)

router.post('/crear', upload.single('imagen'), blogValidations, blogController.crear)

router.patch('/eliminar/:id', blogPermissions('eliminar'), blogController.eliminar)

router.patch('/visibilidad/:id', blogPermissions('visibilidad'), blogController.cambiarVisibilidad)

module.exports = router