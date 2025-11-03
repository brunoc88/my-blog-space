const Blog = require('../models/blog')

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
        if(myLike) {
            blog.likes = blog.likes.filter(u => u.toString() !== req.user.id) //<-- quito like
            await blog.save()
            return res.status(200).json({mensaje:'Like quitado'})
        }
        blog.likes.push(req.user.id)
        await blog.save()
        return res.status(200).json({mensaje:'Like agregado'})
    } catch (error) {
        next(error)
    }
}




