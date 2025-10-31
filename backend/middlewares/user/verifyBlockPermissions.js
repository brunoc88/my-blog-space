const verifyBlockPermissions = (req, res, next) => {
    const { yo, userTo } = req

    const isSelf = yo.id === userTo.id
    const bothAdmin = yo.rol === 'admin' && userTo.rol === 'admin'
    const userIsAdminAndMineIsComun = yo.rol === 'comun' && userTo.rol === 'admin'

    if (isSelf)
        return res.status(400).json({ mensaje: 'No puedes bloquearte a ti mismo' })
    if (bothAdmin)
        return res.status(400).json({ mensaje: 'No puedes bloquear a otro admin' })
    if (userIsAdminAndMineIsComun)
        return res.status(400).json({ mensaje: 'No puedes bloquear a un admin' })

    next()
}

module.exports = verifyBlockPermissions
