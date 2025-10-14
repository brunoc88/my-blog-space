const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        maxlength: 15,
        minlength: 5
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'Email no válido'
        }
    },
    password: {
        type: String,
        required: true,
        maxlength: 15,
        minlength: 6
    },
    pregunta: {
        type: String,
        required: true
    },
    respuesta: {
        type: String,
        required: true,
        maxlength: 30,
        minlength: 5
    },
    imagen: {
        type: String,
        default: 'default.png'
    },
    suspendida: {
        type: Boolean,
        default: false
    }
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.password
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User
