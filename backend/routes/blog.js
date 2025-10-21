const router = require('express').Router()
const upload = require('../utils/multer')
const blogValidations = require('../middlewares/blogValidations')
const { userExtractor } = require('../middlewares/authMiddleware')
const blogController = require('../controllers/blog')


router.use(userExtractor)

router.post('/crear', upload.single('imagen'), blogValidations, blogController.crear)

module.exports = router