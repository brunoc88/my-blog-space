const Blog = require('../models/blog')
const { loadUsers, getUsers } = require('./test_helper')
const { loadTags, getTags } = require('./dummy_tags')

const loadBlogs = async (accion) => {
    await loadUsers()
    if (!accion || accion !== 'noTags') await loadTags() // <-- se puso condicion por testing de perfil.test.js

    const tags = await getTags()
    const users = await getUsers()

    const blog = new Blog({
        titulo: 'Fake Title',
        nota: 'Nada para explicar aqui',
        tags: [tags[0].id],
        visibilidad: true,
        permitirComentarios: true,
        autor: users[0].id
    })

    const blog2 = new Blog({
        titulo: 'Fake Title2',
        nota: 'Nada para explicar aqui tampoco',
        tags: [tags[1].id],
        visibilidad: false,
        permitirComentarios: false,
        autor: users[1].id
    })

    const blog3 = new Blog({
        titulo: 'Fake Title3',
        nota: 'ya no se que escribir como nota',
        tags: [tags[0].id],
        visibilidad: false,
        permitirComentarios: false,
        autor: users[1].id,
        estado: false
    })

    const blog4 = new Blog({
        titulo: 'Fake Title4',
        nota: 'ya no se que escribir como nota, ya van 4',
        tags: [tags[0].id],
        visibilidad: true,
        permitirComentarios: false,
        autor: users[1].id
    })

    const blog5 = new Blog({
        titulo: 'Fake Title5',
        nota: 'ya no se que escribir como nota, ya van 5',
        tags: [tags[0].id],
        visibilidad: true,
        permitirComentarios: false,
        autor: users[2].id
    })

    const blog6 = new Blog({
        titulo: 'Fake Title6',
        nota: 'ya no se que escribir como nota, ya van 6',
        tags: [tags[0].id],
        visibilidad: true,
        permitirComentarios: false,
        autor: users[5].id
    })

    const blog7 = new Blog({
        titulo: 'Fake Title7',
        nota: 'ya no se que escribir como nota, ya van 7',
        tags: [tags[0].id],
        visibilidad: true,
        permitirComentarios: false,
        autor: users[6].id
    })

    const blog8 = new Blog({
        titulo: 'Fake Title8',
        nota: 'ya no se que escribir como nota, ya van 8',
        tags: [tags[0].id],
        visibilidad: true,
        permitirComentarios: false,
        autor: users[6].id
    })


    const blog9 = new Blog({
        titulo: 'Fake Title9',
        nota: 'ya no se que escribir como nota, ya van 9',
        tags: [tags[0].id],
        visibilidad: true,
        permitirComentarios: false,
        autor: users[7].id
    })


    const blog10 = new Blog({
        titulo: 'Fake Title10',
        nota: 'ya no se que escribir como nota, ya van 10',
        tags: [tags[0].id],
        visibilidad: true,
        permitirComentarios: false,
        autor: users[8].id
    })

    const blog11 = new Blog({
        titulo: 'Fake Title11',
        nota: 'ya no se que escribir como nota, ya van 11',
        tags: [tags[0].id],
        visibilidad: true,
        permitirComentarios: true,
        autor: users[8].id
    })

    const blog12 = new Blog({
        titulo: 'Fake Title12',
        nota: 'ya no se que escribir como nota, ya van 12',
        tags: [tags[0].id],
        visibilidad: true,
        permitirComentarios: true,
        autor: users[9].id
    })


    await blog.save()
    await blog2.save()
    await blog3.save()
    await blog4.save()
    await blog5.save()
    await blog6.save()
    await blog7.save()
    await blog8.save()
    await blog9.save()
    await blog10.save()
    await blog11.save()
    await blog12.save()
}


const getBlogs = async () => {
    const blogs = await Blog.find({})
    return blogs.map(b => b.toJSON())
}

module.exports = {
    loadBlogs,
    getBlogs
}