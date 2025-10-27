const Blog = require('../../models/blog')
const User = require('../../models/user')

const blogPermissions = (accion) => async (req, res, next) => {
  try {
    const { id } = req.params
    const blog = await Blog.findById(id)

    if (!blog) return res.status(404).json({ mensaje: 'No se encontró blog' })
    if (!blog.estado) return res.status(400).json({ mensaje: 'El blog ya se encuentra eliminado' })

    const author = await User.findById(blog.autor)
    if (!author) return res.status(404).json({ mensaje: 'Usuario autor no encontrado' })
    if (author.suspendida) return res.status(400).json({ mensaje: 'Usuario eliminado' })

    const isSelf = author.id === req.user.id
    const sameRole = author.rol === req.user.rol


    if (accion === 'eliminar') {
      // Si NO es el dueño y tienen el mismo rol → prohibido
      if (!isSelf && sameRole) {
        return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' })
      }

      // Si No es el dueño, tienen diferente rol y el usuario no es admin
      if (!isSelf && !sameRole && req.user.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' })
      }
    }

    if (accion === 'visibilidad') {
      // solo el autor puede cambiar la visibilidad del blog
      if (!isSelf) {
        return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' })
      }
    }
    req.blog = blog
    next()

  } catch (error) {
    next(error)
  }
}

module.exports = blogPermissions