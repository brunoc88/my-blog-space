const Blog = require('../../models/blog')

const verifyBlogAction = (accion) => async (req, res, next) => {
  try {
    const { id } = req.params
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

    next()
  } catch (error) {
    next(error)
  }
}

module.exports = verifyBlogAction
