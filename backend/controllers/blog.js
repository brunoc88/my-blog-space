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