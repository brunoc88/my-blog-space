const { emailValidations, preguntaValidation, respuestaValidations } = require('../../utils/user/validations')

const recoveryPasswordValidations = (req, res, next) => {
    let { email, pregunta, respuesta } = req.body

    let typeChecks = {
        email: 'string',
        pregunta: 'string',
        respuesta: 'string'
    }
    let errores = {}

    for (const [campo, tipoEsperado] of Object.entries(typeChecks)) {
        if (campo in req.body && typeof req.body[campo] !== tipoEsperado) {
            errores[campo] = `El campo '${campo}' debe ser de tipo ${tipoEsperado}`
        }
    }

    if (Object.keys(errores).length > 0) {
        return res.status(400).json({ error: errores })
    }

    let sanitized = {
        email: email?.trim().toLowerCase(),
        pregunta: pregunta?.trim().toLowerCase(),
        respuesta: respuesta
            ?.trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
    }

    const emailError = emailValidations(sanitized.email)
    if (emailError) errores.email = emailError

    const preguntaError = preguntaValidation(sanitized.pregunta)
    if (preguntaError) errores.pregunta = preguntaError

    const respuestaError = respuestaValidations(sanitized.respuesta)
    if (respuestaError) errores.respuesta = respuestaError

    if (Object.keys(errores).length > 0) {
        return res.status(400).json({ error: errores })
    }


    // creo propiedad recovery y paso los datos limpios
    req.recovery = sanitized

    next()
}

module.exports = recoveryPasswordValidations