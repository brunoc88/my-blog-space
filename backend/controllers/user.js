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
    await User.findByIdAndUpdate(id, { suspendida: true }, { new: true })
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

    if (user.estado) user.estado = false
    else user.estado = true

    await user.save()

    return res.status(200).json({ mensaje: `Tu cuenta ahora es ${user.estado ? 'publica' : 'privada'}`, user })
  } catch (error) {
    next(error)
  }
}

exports.seguir = async (req, res, next) => {
  try {
    const { id } = req.params
    let yo = req.yo
    let userTo = req.userTo

    // Verificamos si la cuenta es privada o publica
    // Si es privada agregamos a solicitudes caso contrario seguimos al usuario

    if (!userTo.estado) {
      userTo.solicitudes.push(req.user.id)
      await userTo.save()
      return res.status(200).json({ mensaje: 'Tu solicitud fue enviada' })
    }

    // agregamos en seguidos
    // a la vez agregamos nuestro id en seguidores del usuario

    yo.seguidos.push(id)
    userTo.seguidores.push(req.user.id)

    await yo.save()
    await userTo.save()

    return res.status(200).json({ mensaje: `Ahora sigues a ${userTo.userName}` })

  } catch (error) {
    next(error)
  }
}

exports.dejarDeSeguir = async (req, res, next) => {
  try {
    const { id } = req.params
    const { myUser, userTo } = req
    myUser.seguidos = myUser.seguidos.filter(u => u.toString() !== id)
    userTo.seguidores = userTo.seguidores.filter(u => u.toString() !== myUser.id)

    await myUser.save()
    await userTo.save()
    return res.status(200).json({ mensaje: `Has dejado de seguir a ${userTo.userName}` })

  } catch (error) {
    next(error)
  }
}

exports.bloquear = async (req, res, next) => {
  try {
    const { yo, userTo } = req

    yo.bloqueos.push(userTo.id)
    await yo.save()

    return res.status(200).json({ mensaje: 'Usuario bloqueado' })
  } catch (error) {
    next(error)
  }
}

exports.desbloquear = async (req, res, next) => {
  try {
    const { id } = req.params
    const { myUser, userTo } = req
    myUser.bloqueos = myUser.bloqueos.filter(u => u.toString() !== id)

    await myUser.save()
    return res.status(200).json({ mensaje: `Has desbloqueado a ${userTo.userName}` })

  } catch (error) {
    next(error)
  }
}

exports.aceptarSolicitud = async (req, res, next) => {
  try {
    let { userTo, myUser } = req

    // acepto y agrego
    myUser.seguidores.push(userTo.id)
    userTo.seguidos.push(myUser.id)

    // elimino la solicitud 
    myUser.solicitudes = myUser.solicitudes.filter(u => u.toString() !== userTo.id)

    await myUser.save()
    await userTo.save()

    return res.status(200).json({ mensaje: `${userTo.userName} ahora te sigue` })

  } catch (error) {
    next(error)
  }
}

exports.rechazarSolicitud = async (req, res, next) => {
  try {
    let { userTo, myUser } = req

    // elimino la solicitud 
    myUser.solicitudes = myUser.solicitudes.filter(u => u.toString() !== userTo.id)

    await myUser.save()

    return res.status(200).json({ mensaje: `Haz rechazado la solicitud de ${userTo.userName}` })

  } catch (error) {
    next(error)
  }
}

exports.listaDeBloqueados = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('bloqueos')
      .populate('bloqueos', 'userName imagen suspendida')

    let bloqueados = user.bloqueos.filter(u => u.suspendida === false)
    
    return res.status(200).json({bloqueados, cantidad: bloqueados.length})
  } catch (error) {
    next(error)
  }
}

exports.listaDeSolicitudes = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('solicitudes')
      .populate('solicitudes', 'userName imagen suspendida')

    let solicitudes = user.solicitudes.filter(u => u.suspendida === false)
    
    return res.status(200).json({solicitudes, cantidad: solicitudes.length})
  } catch (error) {
    next(error)
  }
}

// temporales: falta populate
exports.miPerfil = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    return res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

exports.perfil = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    return res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}