const { 
    emailValidations, 
    preguntaValidation, 
    respuestaValidations 
} = require('../../utils/user/validations')

const recoveryPasswordValidations = (req, res, next) => {
    const { email, pregunta, respuesta } = req.body
    const errores = {}

    // Verificación de tipos esperados
    const typeChecks = {
        email: 'string',
        pregunta: 'string',
        respuesta: 'string'
    }

    for (const [campo, tipoEsperado] of Object.entries(typeChecks)) {
        if (campo in req.body && typeof req.body[campo] !== tipoEsperado) {
            errores[campo] = `El campo '${campo}' debe ser de tipo ${tipoEsperado}`
        }
    }

    if (Object.keys(errores).length > 0) {
        return res.status(400).json({ error: errores })
    }

    // Sanitizacion
    const sanitized = {
        email: email?.trim().toLowerCase(),
        pregunta: pregunta?.trim().toLowerCase(),
        respuesta: respuesta
            ?.trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // elimina acentos
    }

    // Validaciones específicas
    const emailError = emailValidations(sanitized.email)
    if (emailError) errores.email = emailError

    const preguntaError = preguntaValidation(sanitized.pregunta)
    if (preguntaError) errores.pregunta = preguntaError

    const respuestaError = respuestaValidations(sanitized.respuesta)
    if (respuestaError) errores.respuesta = respuestaError

    if (Object.keys(errores).length > 0) {
        return res.status(400).json({ error: errores })
    }

    // Asignamos valores limpis creando propiedad recovery al objeto req 
    req.recovery = sanitized

    // Pasamos al siguiente controlador (recoveryPasswordGuard)
    next()
}

module.exports = recoveryPasswordValidations
