const User = require('../models/user')

const verifyBlock = async (req, res, next) => {
  try {
    const { id } = req.params
    const { userTo } = req // <-- proveniente de verifyActionBlog

    // Usuario autenticado
    const yo = await User.findById(req.user.id)

    if (req.favs) {
      req.yo = yo
      return next()
    } //<-- si fav proviente de verifyActionBlog es verdad salteamos este middleware

    // Usuario objetivo
    let user = ''
    if (userTo) {
      user = await User.findById(userTo.id)
    } else {
      user = await User.findById(id)
    }
   
    if (!user) return res.status(404).json({ mensaje: 'Cuenta no encontrada' })
    if (user.suspendida) return res.status(403).json({ mensaje: 'Cuenta eliminada' })


    // Chequeamos bloqueos (aseguramos que existan arrays)
    const misBloqueados = yo.bloqueos || []
    const susBloqueados = user.bloqueos || []


    if (misBloqueados.includes(user.id)) {
      return res.status(400).json({ mensaje: `Tienes bloqueado a ${user.userName}` })
    }

    if (susBloqueados.includes(req.user.id)) {
      return res.status(400).json({ mensaje: `${user.userName} te ha bloqueado` })
    }

    req.yo = yo
    req.userTo = user
    next()

  } catch (error) {
    next(error)
  }
}

module.exports = verifyBlock
