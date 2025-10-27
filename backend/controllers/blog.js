const Blog = require('../models/blog')

exports.crear = async (req, res, next) => {
    try {
        const { titulo, nota, tags, visibilidad, permitirComentarios } = req.body

        let newBlog = new Blog({
            titulo,
            nota,
            tags,
            imagen: req.file ? req.file.filename : 'default.png',
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



