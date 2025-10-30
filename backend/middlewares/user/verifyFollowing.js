const verifyFollowing = (req, res, next) => {
    const { id } = req.params
    const yo = req.yo

    if (id === req.user.id) return res.status(400).json({ mensaje: 'No puedes seguirte a ti mismo' })

    // Chequeamos bloqueos (aseguramos que existan arrays)
    const misSeguidos = yo.seguidos || []

    if (misSeguidos.includes(id)) {
        return res.status(400).json({ mensaje: 'Ya sigues esta cuenta' })
    }

    next()
}

module.exports = verifyFollowing