const errorHandler = (error, req, res, next) => {
    // Error de validación (Mongoose: required, minlength, match, etc.)
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(e => e.message)
        return res.status(400).json({ error: errors })
    }

    // Error por duplicado (email o username únicos)
    if (error.code === 11000) {
        const duplicados = Object.keys(error.keyValue)
        const mensaje = duplicados.map(campo => 
            `El ${campo} '${error.keyValue[campo]}' ya está registrado`
        )
        return res.status(400).json({ error: mensaje })
    }

    // Error por ID inválido
    if (error.name === 'CastError') {
        return res.status(400).json({ error: [`ID inválido: ${error.value}`] })
    }

    // Error genérico
    return res.status(500).json({
        error: ['Error del servidor'],
        detalle: error.message
    })
}

module.exports = errorHandler
