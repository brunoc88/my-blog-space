const Tag = require('../models/tag')

exports.crearEtiqueta = async (req, res, next) => {
    try {
        let { nombre } = req.body

        const nuevaEtiqueta = new Tag({ nombre })

        const etiquetaGuardada = await nuevaEtiqueta.save()

        res.status(201).json({
            message: 'Etiqueta creada con éxito',
            tag: etiquetaGuardada
        })

    } catch (error) {
        next(error)
    }
}