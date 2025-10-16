const { passwordValidations } = require('../utils/user/validations')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const loginValidation = async (req, res, next) => {
    try {
        let { user, password } = req.body
        const error = {}

        // Sanitización y normalización
        user = user?.trim().toLowerCase()
        password = password?.trim()

        // Validaciones de presencia y formato
        if (!user || user.length === 0) error.user = 'Ingrese un usuario o email'

        const passwordError = passwordValidations(password)
        if (passwordError) error.password = passwordError

        if (Object.keys(error).length > 0) 
            return res.status(400).json({ error })

        // Validación de existencia
        const currentUser = await User.findOne({
            $or: [
                { userName: user },
                { email: user }
            ]
        })

        if (!currentUser || currentUser.suspendida) 
            return res.status(404).json({ error: { invalid: 'Cuenta inexistente o suspendida' } })

        // Comparación de password correctamente
        const isMatch = await bcrypt.compare(password, currentUser.password)
        if (!isMatch) 
            return res.status(400).json({ error: { password: 'Password incorrecto' } })

        // Preparar req.user
        req.user = {
            id: currentUser._id,
            email: currentUser.email,
            userName: currentUser.userName,
            rol: currentUser.rol,
            imagen: currentUser.imagen
        }

        next()
    } catch (err) {
        next(err)
    }
}

module.exports = loginValidation
