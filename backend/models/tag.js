const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la etiqueta es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [30, 'El nombre no puede tener más de 30 caracteres'],
    unique: true,
    lowercase: true,
    match: [/^[a-z0-9áéíóúñ\s-]+$/i, 'El nombre solo puede contener letras, números, espacios y guiones']
  },
  estado: {
    type: Boolean,
    default: true
  }
})

tagSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Tag = mongoose.model('Tag', tagSchema)

module.exports = Tag
