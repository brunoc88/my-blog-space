const router = require('express').Router()
const tagValidations = require('../middlewares/tagValidations')
const { verifyRole, userExtractor } = require('../middlewares/authMiddleware')
const tagController = require('../controllers/tag')

router.use(userExtractor)
router.use(verifyRole('admin'))

router.post('/crear', tagValidations, tagController.crearEtiqueta)

router.patch('/desactivar/:id', tagController.desactivar)

module.exports = router