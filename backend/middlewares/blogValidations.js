const blogValidations = (req, res, next) => {
    let { titulo, nota, tags, visibilidad, permitirComentarios } = req.body
    const errores = {}

    let typeChecks = {
        titulo: 'string',
        nota: 'string',
        visibilidad: 'boolean',
        permitirComentarios: 'boolean'
    }

    for (const [campo, tipoEsperado] of Object.entries(typeChecks)) {
        if (campo in req.body && typeof req.body[campo] !== tipoEsperado) {
            errores[campo] = `El campo '${campo}' debe ser de tipo ${tipoEsperado}`
        }
    }

    if (Object.keys(errores).length > 0) {
        return res.status(400).json({ error: errores })
    }

    let sanitized = {
        titulo: titulo?.trim(),
        nota: nota?.trim(),
        visibilidad,
        tags,
        permitirComentarios
    }

    if ('titulo' in req.body) {
        if (!sanitized.titulo || sanitized.titulo.length === 0) errores.titulo = 'El título es obligatorio'
        if (sanitized.titulo) {
            if (sanitized.titulo.length < 5) errores.titulo = 'El título debe tener al menos 5 caracteres'
            if (sanitized.titulo.length > 100) errores.titulo = 'El título no puede exceder 100 caracteres'

            const regex = /^[a-zA-Z0-9áéíóúñ\s.,!?-]+$/i
            if (!regex.test(sanitized.titulo)) {
                errores.titulo = 'El título solo puede contener letras, números y signos básicos'
            }
        }
    }

    if ('nota' in req.body) {
        if (!sanitized.nota || sanitized.nota.length === 0) errores.nota = 'La nota es obligatoria'
        if (sanitized.nota) {
            if (sanitized.nota.length < 20) errores.nota = 'La nota debe tener al menos 20 caracteres'
            if (sanitized.nota.length > 5000) errores.nota = 'La nota no puede exceder 5000 caracteres'
        }
    }

    if ('tags' in req.body) {
        if (!Array.isArray(tags)) {
            errores.tags = 'El campo "tags" debe ser un array'
        } else if (tags.length === 0) {
            errores.tags = 'Debe incluir al menos una etiqueta'
        }
    }

    if ('visibilidad' in req.body) {
        if (visibilidad === null || visibilidad === '') errores.visibilidad = 'Debe elegir privado o publico'
    }

    if ('permitirComentarios' in req.body) {
        if (permitirComentarios === null || permitirComentarios === '') errores.permitirComentarios = 'Debe elegir si los comentarios van estar publicos o no'
    }

    if (Object.keys(errores).length > 0) return res.status(400).json({ error: errores })

    req.body = sanitized
    next()
}

module.exports = blogValidations
