const User = require('../models/user')

const suspensionGuard = async (req, res, next) => {
    const miUser = req.user
    const { id } = req.params

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Cuenta inexistente' })
    if (user.suspendida) return res.status(403).json({ error: 'Cuenta suspendida' })

    const sameId = user.id === miUser.id // Chequeamos que sean mismo id
    const bothAdmins = user.rol === 'admin' && miUser.rol === 'admin' // Si ambos son admin
    const notSameRol = miUser.rol === 'comun' && user.rol === 'admin' // Si ambos tienen diferente rol
    
    if (!sameId && bothAdmins) {
        return res.status(403).json({ error: 'Un admin no puede suspender a otro admin' });
    }

    if(!sameId && notSameRol) {
        return res.status(403).json({ error: 'No puedes suspender a un admin' });
    }

    next()
}

module.exports = suspensionGuard