const Tag = require('../models/tag')

exports.crearEtiqueta = async (req, res, next) => {
    try {
        let { nombre } = req.body

        const nuevaEtiqueta = new Tag({ nombre })

        const etiquetaGuardada = await nuevaEtiqueta.save()

        res.status(201).json({
            mensaje: 'Etiqueta creada con éxito',
            tag: etiquetaGuardada
        })

    } catch (error) {
        next(error)
    }
}

exports.desactivar = async (req, res, next) => {
    try {
        const { id } = req.params

        let tag = await Tag.findById(id)

        if (!tag) return res.status(404).json({ error: 'Etiqueda no encontrada' })
        if (!tag.estado) return res.status(403).json({ error: 'Etiqueda ya desabilitada' })

        tag.estado = false
        await tag.save()

        return res.status(200).json({
            mensaje: 'Etiqueda desabilitada', tag: {
                id: tag.id,
                nombre: tag.nombre,
                estado: tag.estado,
            }
        })

    } catch (error) {
        next(error)
    }
}