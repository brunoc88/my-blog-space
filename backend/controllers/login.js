const jwt = require('jsonwebtoken')

exports.login = (req, res, next) => {
    try {
        const { id, userName, email, rol, imagen } = req.user

        let userForToken = {
            id,
            userName,
            email,
            rol,
            imagen
        }

        let token = jwt.sign(
            userForToken,
            process.env.SECRET,
            { expiresIn: '1h' }
        )

        return res.status(200).json(
            {
                msj: 'Login exitoso!',
                user: userForToken,
                token
            }
        )

    } catch (error) {
        next(error)
    }
}