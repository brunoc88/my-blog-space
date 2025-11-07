const Blog = require('../models/blog')
const User = require('../models/user')

exports.crear = async (req, res, next) => {
    try {
        const { titulo, nota, tags, visibilidad, permitirComentarios } = req.body

        let newBlog = new Blog({
            titulo,
            nota,
            tags,
            imagen: req.file ? req.file.filename : '',
            visibilidad,
            permitirComentarios,
            autor: req.user.id
        })

        await newBlog.save()
        return res.status(201).json({ mensaje: 'Blog creado', blog: newBlog })
    } catch (error) {
        next(error)
    }
}

exports.eliminar = async (req, res, next) => {
    try {
        const blog = req.blog
        blog.estado = false
        await blog.save()

        return res.status(200).json({ mensaje: 'Blog eliminado correctamente' })
    } catch (error) {
        next(error)
    }
}

exports.cambiarVisibilidad = async (req, res, next) => {
    try {

        if (req.blog.visibilidad) {
            req.blog.visibilidad = false
            req.blog.permitirComentarios = false
            await req.blog.save()
        } else {
            req.blog.visibilidad = true
            await req.blog.save()
        }

        res.status(200).json({ mensaje: 'Visibilidad actualizada', blog: req.blog })
    } catch (error) {
        next(error)
    }
}

exports.permitirComentarios = async (req, res, next) => {
    try {
        const blog = req.blog

        if (!blog.visibilidad) {
            return res.status(400).json({
                mensaje: 'Para habilitar los comentarios el blog debe ser público'
            })
        }

        // Alternar permitirComentarios
        if (blog.permitirComentarios) {
            blog.permitirComentarios = false
            await blog.save()
            return res.status(200).json({
                mensaje: 'Comentarios deshabilitados',
                blog
            })
        } else {
            blog.permitirComentarios = true
            await blog.save()
            return res.status(200).json({
                mensaje: 'Comentarios habilitados',
                blog
            })
        }

    } catch (error) {
        next(error)
    }
}

exports.editar = async (req, res, next) => {
    try {
        const id = req.params.id
        const cambios = req.body

        if (req.file) {
            cambios.imagen = req.file.filename
        }

        await Blog.findByIdAndUpdate(id, cambios, { new: true })
        return res.status(200).json({ mensaje: 'Blog actualizado', blog: cambios })
    } catch (error) {
        next(error)
    }
}

exports.like = async (req, res, next) => {
    try {
        let { blog } = req

        // verifico si hay like previo
        // para cambiar la accion a quitarle el like
        const myLike = blog.likes.some(u => u.toString() === req.user.id)
        if (myLike) {
            blog.likes = blog.likes.filter(u => u.toString() !== req.user.id) //<-- quito like
            await blog.save()
            return res.status(200).json({ mensaje: 'Like quitado' })
        }
        blog.likes.push(req.user.id)
        await blog.save()
        return res.status(200).json({ mensaje: 'Like agregado' })
    } catch (error) {
        next(error)
    }
}

exports.disLike = async (req, res, next) => {
    try {
        let { blog } = req

        // verifico si hay dislike previo
        // para cambiar la accion a quitarle el dislike
        const myDislike = blog.dislikes.some(u => u.toString() === req.user.id)
        if (myDislike) {
            blog.dislikes = blog.dislikes.filter(u => u.toString() !== req.user.id) //<-- quito like
            await blog.save()
            return res.status(200).json({ mensaje: 'Dislike quitado' })
        }
        blog.dislikes.push(req.user.id)
        await blog.save()
        return res.status(200).json({ mensaje: 'Dislike agregado' })
    } catch (error) {
        next(error)
    }
}

exports.fav = async (req, res, next) => {
    try {
        let { blog, favs, yo } = req

        // Verifico si ya el usuario ya agrego el blog a sus favoritos y viceverza
        // Si es asi elimino el seguimiento en ambas partes

        if (favs) {
            blog.favoritos = blog.favoritos.filter(u => u.toString() !== yo.id)
            yo.favoritos = yo.favoritos.filter(b => b.toString() !== blog.id)
            await blog.save()
            await yo.save()
            return res.status(200).json({ mensaje: 'Blog eliminado de favoritos' })
        }

        blog.favoritos.push(yo.id)
        yo.favoritos.push(blog.id)
        await blog.save()
        await yo.save()
        return res.status(200).json({ mensaje: 'Blog agregado a favoritos' })

    } catch (error) {
        next(error)
    }
}

exports.comentar = async (req, res, next) => {
    try {
        let { blog, yo, mensaje } = req

        let comentario = {
            mensaje,
            usuario: yo.id
        }
        blog.comentarios.push(comentario)
        await blog.save()

        // populate solo el último comentario
        await blog.populate({
            path: 'comentarios.usuario',
            select: 'userName imagen'
        })

        const ultimoComentario = blog.comentarios[blog.comentarios.length - 1]
        return res.status(201).json({ mensaje: 'Comentario agregado', comentario: ultimoComentario })
    } catch (error) {
        next(error)
    }
}

exports.editarComentario = async (req, res, next) => {
    try {
        const { blog, mensaje } = req

        // se tuvo que optar por este metodo
        // Ya que no se realizaba el cambio de comentario
        await Blog.updateOne(
            { _id: blog.id, 'comentarios._id': req.params.idComment },
            { $set: { 'comentarios.$.mensaje': mensaje } }
        )

        const blogActualizado = await Blog.findById(blog._id)
            .populate('comentarios.usuario', 'userName imagen')

        const comentarioActualizado = blogActualizado.comentarios.id(req.params.idComment)

        return res.status(200).json({
            mensaje: 'Comentario editado',
            comentario: comentarioActualizado
        })
    } catch (error) {
        next(error)
    }
}

exports.eliminarComentario = async (req, res, next) => {
    try {
        let { blog, idComment } = req

        blog.comentarios = blog.comentarios.filter(c => c.toString() !== idComment)
        await blog.save()
        return res.status(200).json({ mensaje: 'Comentario eliminado exitosamente' })
    } catch (error) {
        next(error)
    }
}

exports.likeComentario = async (req, res, next) => {
    try {
        let { blog, comment, yo } = req

        // pregunto si mi like ya esta registrado
        // Verificar si ya le dio like
        const yaDioLike = comment.likes.some(like => like.toString() === yo.id)

        if (yaDioLike) {
            comment.likes = comment.likes.filter(like => like.toString() !== yo.id)
            await blog.save()
            return res.status(200).json({ mensaje: 'Like quitado' })
        }

        // Agregar like
        comment.likes.push(yo.id)
        await blog.save()

        return res.status(200).json({ mensaje: 'Diste like' })

    } catch (error) {
        next(error)
    }
}

exports.userBlogs = async (req, res, next) => {
    try {
        const { id } = req.params
        let blogs = ''
        if (id) {
            // Devuelvo blog activos y publicos del usuario a buscar 
            blogs = await Blog.find({ autor: id, estado: true, visibilidad: true })
        } else {
            // Devuelvo todos mis blogs activos
            blogs = await Blog.find({ autor: req.user.id, estado: true })
        }

        return res.status(200).json({ blogs })
    } catch (error) {
        next(error)
    }
}

exports.getBlog = async (req, res, next) => {
    try {
        const { id } = req.params

        const blog = await Blog.findById(id)
            .populate('tags', 'nombre')
            .populate('comentarios.usuario', 'userName imagen')
            .populate('autor', 'userName')

        return res.status(200).json({ blog })
    } catch (error) {
        next(error)
    }
}

exports.allFollowingUsersBlogs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('seguidos bloqueados')

    const blogs = await Blog.find({
      estado: true,
      visibilidad: true,
      autor: { $in: user.seguidos, $nin: user.bloqueados }
    })
      .populate({
        path: 'autor',
        select: 'userName imagen seguidores bloqueados estado',
        match: { estado: true, bloqueados: { $ne: user._id } } // no me bloqueó
      })
      .sort({ fecha: -1 })

    const cleanBlogs = blogs.filter(b => b.autor !== null)

    return res.status(200).json({ blogs: cleanBlogs })
  } catch (error) {
    next(error)
  }
}

exports.allPublicBlogs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('seguidos bloqueados')

    // blogs públicos, activos, de autores que NO sigo y que no me bloqueen
    const blogs = await Blog.find({
      estado: true,
      visibilidad: true,
      autor: { $nin: [...user.seguidos, ...user.bloqueados] } // ni seguidos ni bloqueados por mí
    })
      .populate({
        path: 'autor',
        select: 'userName imagen seguidores bloqueados estado',
        match: { estado: true, bloqueados: { $ne: user._id } } // autores activos y que no me bloqueen
      })
      .sort({ fecha: -1 })

    // filtrar los blogs cuyo populate devolvió null
    const cleanBlogs = blogs.filter(b => b.autor !== null)

    return res.status(200).json({ blogs: cleanBlogs })
  } catch (error) {
    next(error)
  }
}



