const {
    userNameValidations,
    emailValidations,
    passwordValidations,
    password2Validations,
    preguntaValidation,
    respuestaValidations,
    claveValidation
} = require('./../utils/user/validations')


const userValidations = (req, res, next) => {

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
    if ('userName' in req.body) {
        const userNameError = userNameValidations(userName)
        if (userNameError) errores.userName = userNameError
    }

    // Validaciones de email
    if ('email' in req.body) {
        const emailError = emailValidations(email)
        if (emailError) errores.email = emailError
    }

    // Validaciones de password
    if ('password' in req.body) {
        const passwordError = passwordValidations(password)
        if (passwordError) errores.password = passwordError
    }

    if ('password2' in req.body) {
        const password2Error = password2Validations(password, password2)
        if (password2Error) errores.password2 = password2Error
    }

    // Validaciones de pregunta y respuesta
    if ('pregunta' in req.body) {
        const preguntaError = preguntaValidation(pregunta)
        if (preguntaError) errores.pregunta = preguntaError
    }

    if ('respuesta' in req.body) {
        const respuestaError = respuestaValidations(respuesta)
        if (respuestaError) errores.respuesta = respuestaError
    }

    // Validacion en rol admin

    if ('clave' in req.body) {
        const { clave } = req.body
        const claveError = claveValidation(clave.trim())
        if (claveError) errores.clave = claveError
    }

    // Si hay errores, responder
    if (Object.keys(errores).length > 0) {
        return res.status(400).json({ error: errores })
    }

    // Si todo OK
    req.body = { userName, email, pregunta, respuesta, password, password2 }
    next()
}

module.exports = userValidations
