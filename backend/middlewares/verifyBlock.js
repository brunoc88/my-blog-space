const User = require('../models/user')

const verifyBlock = async (req, res, next) => {
  try {
    const { id } = req.params

    // Usuario objetivo
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ mensaje: 'Cuenta no encontrada' })
    if (user.suspendida) return res.status(403).json({ mensaje: 'Cuenta eliminada' })

    // Usuario autenticado
    const yo = await User.findById(req.user.id)

    // Chequeamos bloqueos (aseguramos que existan arrays)
    const misBloqueados = yo.bloqueos || []
    const susBloqueados = user.bloqueos || []

    
    if (misBloqueados.includes(id)) {
      return res.status(400).json({ mensaje: `Tienes bloqueado a ${user.userName}` })
    }

    if (susBloqueados.includes(req.user.id)) {
      return res.status(400).json({ mensaje: `${user.userName} te ha bloqueado` })
    }

    next()
  } catch (error) {
    next(error)
  }
}

module.exports = verifyBlock
