const User = require('../../models/user')

const verifyUnblock = async (req, res, next) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)
        const myUser = await User.findById(req.user.id)

        if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' })
        if (user.suspendida) return res.status(403).json({ mensaje: 'Cuenta eliminada' })

        const isBlocked = myUser.bloqueos.some(u => u.toString() === id)
        if (!isBlocked) return res.status(404).json({ mensaje: 'El usuario no está en tu lista de bloqueos' })
        
        req.myUser = myUser
        req.userTo = user

        next()
    } catch (error) {
        next(error)
    }
}

module.exports = verifyUnblock