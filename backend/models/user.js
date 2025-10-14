const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        maxLength: 15,
        minLenght: 5
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        maxLength:15,
        minLenght:6
    },
    pregunta: {
        type: String,
        required: true
    },
    respuesta: {
        type: String,
        required: true,
        maxLength: 30,
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
        // el passwordHash no debe mostrarse
        delete returnedObject.password
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User