const User = require('../models/user')
const bcrypt = require('bcrypt')
const generatePassword = require('../utils/user/generatePassword')

exports.crearUser = async (req, res, next) => {
  const admin = req.params.admin
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
      rol: admin && req.body.clave === process.env.KEY
        ? 'admin'
        : 'comun'
      ,
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

exports.suspenderCuenta = async (req, res, next) => {
  try {
    let id = req.params.id
    await User.findByIdAndUpdate(id, { susendida: true }, { new: true })
    return res.status(200).json({ mensaje: 'Cuenta suspendida' })
  } catch (error) {
    next(error)
  }
}

exports.editarCuenta = async (req, res, next) => {
  try {
    const { id } = req.user
    const cambios = req.body

    await User.findByIdAndUpdate(id, cambios)
    return res.status(200).json({ mensaje: 'Datos acuatilzados', user: cambios })
  } catch (error) {
    next(error)
  }
}

exports.recuperarPassword = async (req, res, next) => {
  try {

    let user = req.user
    const tempPassword = generatePassword()
    const hashed = await bcrypt.hash(tempPassword, 10)

    user.password = hashed
    await user.save()

    return res.status(200).json({
      mensaje: 'Contraseña temporal generada correctamente',
      tempPassword
    })

  } catch (error) {
    next(error)
  }
}

exports.estado = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    if(user.estado) user.estado = false
    else user.estado = true

    await user.save()

    return res.status(200).json({mensaje:`Tu cuenta ahora es ${user.estado?'publica':'privada'}`, user})
  } catch (error) {
    next(error)
  }
}
