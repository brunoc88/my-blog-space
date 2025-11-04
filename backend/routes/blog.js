const router = require('express').Router()
const upload = require('../utils/multer')
const blogValidations = require('../middlewares/blog/blogValidations')
const blogPermissions = require('../middlewares/blog/blogPermissions')
const { userExtractor } = require('../middlewares/authMiddleware')
const verifyBlock = require('../middlewares/verifyBlock')
const verifyBlogAction = require('../middlewares/blog/verifyBlogAction')
const blogController = require('../controllers/blog')


router.use(userExtractor)

router.post('/crear', upload.single('imagen'), blogValidations, blogController.crear)

router.patch('/eliminar/:id', blogPermissions('eliminar'), blogController.eliminar)

router.patch('/visibilidad/:id', blogPermissions('visibilidad'), blogController.cambiarVisibilidad)

router.patch('/permitirComentarios/:id', blogPermissions('comentarios'), blogController.permitirComentarios)

router.put('/editar/:id', upload.single('imagen'), blogPermissions('editar'), blogValidations, blogController.editar)

router.patch('/:id/like', verifyBlogAction('like'), verifyBlock, blogController.like)

router.patch('/:id/dislike', verifyBlogAction('dislike'), verifyBlock, blogController.disLike)

router.patch('/:id/fav', verifyBlogAction('favoritos'), verifyBlock, blogController.fav)


module.exports = router