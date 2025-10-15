const userValidations = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Formulario vacío!' })
    }

    let { userName, email, pregunta, respuesta, password, password2 } = req.body

    // Sanitización
    userName = userName?.trim().toLowerCase()
    email = email?.trim().toLowerCase()
    pregunta = pregunta?.trim().toLowerCase()
    respuesta = respuesta
        ?.trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    password = password?.trim()
    password2 = password2?.trim()

    const errores = {}

    // Validaciones de userName
    if (!userName) errores.userName = 'Ingrese un nombre'
    else if (userName.length > 15) errores.userName = 'Máximo 15 caracteres'
    else if (userName.length < 5) errores.userName = 'Mínimo 5 caracteres'

    // Validaciones de email
    if (!email) errores.email = 'Ingrese un email'
    else if (/\s/.test(email)) errores.email = 'El email no debe contener espacios'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errores.email = 'El email no tiene un formato válido'

    // Validaciones de password
    if (!password) errores.password = 'Ingrese un password'
    else if (password.length < 6) errores.password = 'Mínimo 6 caracteres'
    else if (/\s/.test(password)) errores.password = 'El password no debe contener espacios'

    if (!password2) errores.password = 'Debe ingresar la confirmación'
    else if (password !== password2)
        errores.password = 'No coinciden los passwords'

    // Validaciones de pregunta y respuesta
    if (!pregunta) errores.pregunta = 'Debe seleccionar una pregunta'
    if (!respuesta) errores.respuesta = 'Debe escribir una respuesta'
    else if (respuesta.length > 30) errores.respuesta = 'Máximo 30 caracteres'
    else if (respuesta.length < 5) errores.respuesta = 'Mínimo 5 caracteres'

    // Si hay errores, responder
    if (Object.keys(errores).length > 0) {
        return res.status(400).json({ error: errores })
    }

    next()
}

module.exports = userValidations
