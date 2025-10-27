const Blog = require('../../models/blog')
const User = require('../../models/user')

const blogPermissions = async (req, res, next) => {
  try {
    const { id } = req.params
    const blog = await Blog.findById(id)

    if (!blog) return res.status(404).json({ mensaje: 'No se encontró blog' })
    if (!blog.estado) return res.status(400).json({ mensaje: 'El blog ya se encuentra eliminado' })

    const author = await User.findById(blog.autor)
    if (!author) return res.status(404).json({ mensaje: 'Usuario autor no encontrado' })

    const isSelf = author.id === req.user.id
    const sameRole = author.rol === req.user.rol
   

    // Si NO es el dueño y tienen el mismo rol → prohibido
    if (!isSelf && sameRole) {
      return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' })
    }

    // Si No es el dueño y su rol no es admin
    if (!isSelf && !sameRole && req.user.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' })
    }

    req.blog = blog
    next()

  } catch (error) {
    next(error)
  }
}

module.exports = blogPermissions
