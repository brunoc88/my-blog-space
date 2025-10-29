const User = require('../../models/user')

const recoveryPasswordGuard = async (req, res, next) => {
    let { email, pregunta, respuesta } = req.recovery

    let user = await User.findOne({ email })

    if (!user) return res.status(404).json({ mensaje: 'Email no encontrado' })
    if (user.suspendida) return res.status(403).json({ mensaje: 'Cuenta eliminada' })

    if (user.pregunta !== pregunta || user.respuesta !== respuesta) {
        return res.status(400).json({ mensaje: 'Pregunta o respuesta incorrecta' })
    }

    req.user = user
    next()
}

module.exports = recoveryPasswordGuard