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
let token2 = null


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

    token = res.body.token
    token2 = res2.body.token

})

describe('PATCH /api/blog/:id/fav', () => {
    test('Agregar blog a favoritos', async () => {
        let user = await User.findById(users[1].id)
        let blog = await Blog.findById(blogs[0].id)
        
        const res = await api
        .patch(`/api/blog/${blogs[0].id}/fav`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200)

        let userAfter = await User.findById(users[1].id)
        let blogAfter = await Blog.findById(blogs[0].id)
        
        expect(res.body).toHaveProperty('mensaje')
        expect(res.body.mensaje).toBe('Blog agregado a favoritos')
        expect(userAfter.favoritos.length).toBe(user.favoritos.length + 1)
        expect(blogAfter.favoritos.length).toBe(blog.favoritos.length + 1)
    })

    test('Quitar blog de favortios', async () => {
        // Act: agregamos un blog a favoritos
        await api
        .patch(`/api/blog/${blogs[0].id}/fav`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200)

        let blog = await Blog.findById(blogs[0].id)
        let user = await User.findById(users[1].id)

        // Act: Quitamos de favoritos el blog

        const res = await api
        .patch(`/api/blog/${blogs[0].id}/fav`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200)

        let blogAfter = await Blog.findById(blogs[0].id)
        let userAfter = await User.findById(users[1].id)

        expect(res.body).toHaveProperty('mensaje')
        expect(res.body.mensaje).toBe('Blog eliminado de favoritos')
        expect(blogAfter.favoritos.length).toBe(blog.favoritos.length - 1)
        expect(userAfter.favoritos.length).toBe(user.favoritos.length - 1)

    })

    test('Agregar blog a favortios estando bloqueados', async () => {
        // Act: Bloqueamos al usuario
        await api
        .patch(`/api/user/bloquear/${users[1].id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
     

        // Act: Intentamos agregar el blog a favoritos con el usuario bloqueado

        const res = await api
        .patch(`/api/blog/${blogs[0].id}/fav`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(400)

        expect(res.body).toHaveProperty('mensaje')
        expect(res.body.mensaje).toBe(`${users[0].userName} te ha bloqueado` )
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})  