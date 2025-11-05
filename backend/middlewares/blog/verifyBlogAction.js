const Blog = require('../../models/blog')
const commentValidations = require('../../utils/commentValidations')

const verifyBlogAction = (accion) => async (req, res, next) => {
  try {
    const { id, idComments } = req.params
    const blog = await Blog.findById(id)

    if (!blog) return res.status(404).json({ mensaje: 'No se encontró el blog' })
    if (!blog.estado) return res.status(403).json({ mensaje: 'Blog eliminado' })
    if (!blog.visibilidad) return res.status(400).json({ mensaje: 'El blog es privado' })

    // guardamos el autor para el verifyBlock
    req.blog = blog
    req.userTo = blog.autor

    if (accion === 'like') {
      const dislikes = blog.dislikes.some(u => u.toString() === req.user.id)
      if (dislikes) return res.status(400).json({ mensaje: 'No puedes dar like si ya diste dislike' })
    }

    if (accion === 'dislike') {
      const likes = blog.likes.some(u => u.toString() === req.user.id)
      if (likes) return res.status(400).json({ mensaje: 'No puedes dar dislike si ya diste like' })
    }

    if (accion === 'favoritos') {
      const favs = blog.favoritos.some(u => u.toString() === req.user.id)
      req.favs = favs
    }

    if (accion === 'comentar' || accion === 'editar comentario') {
      let { mensaje } = req.body
      
      // Sanitizacion
      mensaje = mensaje?.trim().toLowerCase()
      const commentError = commentValidations(mensaje)
      if (commentError) return res.status(400).json({ mensaje: commentError })
      if(!blog.permitirComentarios) return res.status(400).json({mensaje:'El autor deshabilito los comentarios'})
      req.mensaje = mensaje
    }

    next()

  } catch (error) {
    next(error)
  }
}

module.exports = verifyBlogAction
