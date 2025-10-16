const userNameValidations = (userName) => {
    if (!userName || userName.length === 0) return 'Ingrese un nombre'
    else if (userName.length > 15) return 'Máximo 15 caracteres'
    else if (userName.length < 5) return 'Mínimo 5 caracteres'
    return null
}

const emailValidations = (email) => {
    if (!email || email.length === 0) return 'Ingrese un email'
    else if (/\s/.test(email)) return 'El email no debe contener espacios'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'El email no tiene un formato válido'
    return null
}

const passwordValidations = (password) => {
    if (!password || password.length === 0) return 'Ingrese un password'
    else if (password.length < 6) return 'Mínimo 6 caracteres'
    else if (/\s/.test(password)) return 'El password no debe contener espacios'
    return null
}

const password2Validations = (password, password2) => {
    if (!password2 || password2.length === 0) return 'Debe ingresar la confirmación'
    else if (password !== password2) return 'No coinciden los passwords'
    return null
}

const preguntaValidation = (pregunta) => {
    if (!pregunta || pregunta.length === 0) return 'Debe seleccionar una pregunta'
    return null
}

const respuestaValidations = (respuesta) => {
    if (!respuesta || respuesta.length === 0) return 'Debe escribir una respuesta'
    else if (respuesta.length > 30) return 'Máximo 30 caracteres'
    else if (respuesta.length < 5) return 'Mínimo 5 caracteres'
    return null
}

const claveValidation = (clave) => {
    const { KEY } = require('../config')
    if (!clave) {
        return 'Ingrese la clave'
    } else if (clave !== KEY) {
        return 'Clave incorrecta'
    }
    return null
}

module.exports = {
    userNameValidations,
    emailValidations,
    passwordValidations,
    password2Validations,
    preguntaValidation,
    respuestaValidations,
    claveValidation
}