const mongoose = require('mongoose')
const app = require('../../app')
const supertest = require('supertest')
const Blog = require('../../models/blog')
const User = require('../../models/user')
const Tag = require('../../models/tag')
const { loadUsers, getUsers } = require('../test_helper')
const { loadBlogs, getBlogs } = require('../fakeBlogs')
const { MONGODB_URI } = require('../../utils/config')
const api = supertest(app)
let users = null
let blogs = null
let token = null
let tokenAdmin = null



beforeAll(async () => {
    await mongoose.connect(MONGODB_URI)
})


beforeEach(async () => {
    // limpiamos db
    await Blog.deleteMany({})
    await User.deleteMany({})
    await Tag.deleteMany({})

    // cargamos db
    await loadUsers()
    await loadBlogs()
    //await loadTags()

    // guardamos users & blogs
    users = await getUsers()
    blogs = await getBlogs()

    // logueamos un usuario comun y un usuario admin

    const res = await api.post('/api/login').send({ user: users[0].userName, password: 'sekret' })
    const res2 = await api.post('/api/login').send({ user: users[1].userName, password: 'sekret' })
    const res3 = await api.post('/api/login').send({ user: users[4].userName, password: 'sekret' })
    const res4 = await api.post('/api/login').send({ user: users[5].userName, password: 'sekret' })

    token = res2.body.token
    tokenUserComun2 = res3.body.token
    tokenAdmin = res.body.token
    tokenAdmin2 = res4.body.token

})

describe('PATCH /api/blog/permitirComentarios/:id', () => {
    describe('Blog privado', () => {
        test('Habilitar comentarios', async () => {
            const res = await api
                .patch(`/api/blog/permitirComentarios/${blogs[1].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(400)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('Para habilitar los comentarios el blog debe ser público')
        })
    })

    describe('Blog publico', () => {
        test('Deshabilitar comentarios', async () => {
            const res = await api
                .patch(`/api/blog/permitirComentarios/${blogs[0].id}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .expect(200)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body).toHaveProperty('blog')
            expect(res.body.mensaje).toBe('Comentarios deshabilitados')
            expect(res.body.blog.permitirComentarios).toBe(false)
        })

        test('Habilitar comentarios', async () => {
            const res = await api
                .patch(`/api/blog/permitirComentarios/${blogs[3].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body).toHaveProperty('blog')
            expect(res.body.mensaje).toBe('Comentarios habilitados')
            expect(res.body.blog.permitirComentarios).toBe(true)
        })
    })

    test('Manipular con usuario diferente', async () => {
            const res = await api
                .patch(`/api/blog/permitirComentarios/${blogs[1].id}`)
                .set('Authorization', `Bearer ${tokenAdmin}`)
                .expect(403)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('No tienes permiso para realizar esta acción')
        })
})


afterAll(async () => {
    await mongoose.connection.close()
})  