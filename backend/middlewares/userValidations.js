const userValidations = (req, res, next) => {
    if(req.body.length === 0 | !req.body) return res.status(400).json({error:'Formulario vacio!'})
    next()
}

module.exports = userValidations