const User = require('../models/user')
const bcrypt = require('bcrypt')

exports.crearUser = async (req, res, next) => {
  
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
      password: passwordHashed
    })

    const savedUser = await newUser.save()

    return res.status(201).json({
      msj: 'Usuario guardado!',
      user: savedUser
    })
  } catch (error) {
    next(error)
  }
}
