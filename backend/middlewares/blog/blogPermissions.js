const Blog = require('../../models/blog')
const User = require('../../models/user')

const blogPermissions = (accion) => async (req, res, next) => {
  try {
    const { id, idComment } = req.params
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

    if (accion === 'visibilidad' || accion === 'comentarios' || accion === 'editar') {
      // solo el autor puede cambiar la visibilidad del blog
      if (!isSelf) {
        return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' })
      }
    }

    if (accion === 'editar comentario') {

      const comment = blog.comentarios.id(idComment) //<-- metodo especial de busqueda de mongoose
      //siver para buscar especificamente subdocumentos. Devuelve directamente un subdocumento

      if (!comment) {
        return res.status(404).json({ mensaje: 'Comentario no encontrado' })
      }

      if (comment.usuario.toString() !== req.user.id) {
        return res.status(403).json({ mensaje: 'No tienes permiso para editar este comentario' })
      }

      req.comment = comment // mantiene el subdocumento accesible
    }

    req.blog = blog
    next()

  } catch (error) {
    next(error)
  }
}

module.exports = blogPermissions