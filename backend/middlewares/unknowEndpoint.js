const unknowEndpoint = (req, res) => {
    return res.status(404).json({error:'Sitio No encontrado!'})
}

module.exports = unknowEndpoint