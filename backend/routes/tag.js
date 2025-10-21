const router = require('express').Router()
const tagValidations = require('../middlewares/tagValidations')
const tagController = require('../controllers/tag')

router.post('/', tagValidations, tagController.crearEtiqueta)

module.exports = router