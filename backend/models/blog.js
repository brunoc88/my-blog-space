const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true,
        minlength: [5, 'El título debe tener al menos 5 caracteres'],
        maxlength: [100, 'El título no puede exceder 100 caracteres'],
        match: [/^[a-zA-Z0-9áéíóúñ\s.,!?-]+$/i, 'El título solo puede contener letras, números y signos básicos']
    },
    imagen: {
        type: String,
        default: ''
    },
    nota: {
        type: String,
        required: [true, 'La nota es obligatoria'],
        trim: true,
        minlength: [20, 'La nota debe tener al menos 20 caracteres'],
        maxlength: [5000, 'La nota no puede exceder 5000 caracteres']
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    visibilidad: {
        type: Boolean,
        required: [true, 'Seleccione si quiere que sea publico o privado']
    },
    permitirComentarios: {
        type: Boolean,
        required:[true, 'Debe elegir si permite los comentarios']
    },
    fecha: {
        type: Date,
        default: () => {
            const today = new Date()
            today.setHours(0, 0, 0, 0) // deja solo la fecha, hora 00:00:00
            return today
        }
    },
    estado:{
        type: Boolean,
        default: true
    },
    autor: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'                        
    }
})

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog