const User = require('../models/user')
const bcrypt = require('bcrypt')

// user comun
exports.crearUser = async (req, res, next) => {
  console.log('🧩 BODY RECIBIDO:', req.body)
  try {
    const {
      userName,
      email,
      respuesta,
      pregunta,
      password
    } = req.body

    const passwordHashed = await bcrypt.hash(password, 10)

    const newUser = new User({
      userName,
      email,
      imagen: req.file ? req.file.filename : 'default.png',
      respuesta,
      pregunta,
      rol:'comun',
      password: passwordHashed
    })

    const savedUser = await newUser.save()

    return res.status(201).json({
      msj: 'Usuario guardado!',
      user: savedUser
    })
  } catch (error) {
    console.log('❌ ERROR EN CREAR USER:', error)
    next(error)
  }
}
