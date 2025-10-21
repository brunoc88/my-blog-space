const tagValidations = (req, res, next) => {
    let { nombre } = req.body

    nombre = nombre?.trim().toLowerCase()

    // Reescribimos el valor ya sanitizado
    req.body.nombre = nombre

    if (!nombre || nombre.length === 0)
        return res.status(400).json({ error: 'Debe ingresar un nombre' })

    if (nombre.length < 2)
        return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' })

    if (nombre.length > 30)
        return res.status(400).json({ error: 'El nombre no puede tener más de 30 caracteres' })

    // Validar formato (solo letras, números, espacios y guiones)
    const regex = /^[a-z0-9áéíóúñ\s-]+$/i
    if (!regex.test(nombre))
        return res.status(400).json({
            error: 'El nombre solo puede contener letras, números, espacios y guiones'
        })

    next()
}

module.exports = tagValidations
