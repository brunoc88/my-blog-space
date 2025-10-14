const userValidations = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Formulario vacío!' })
    }
    next()
}   

module.exports = userValidations