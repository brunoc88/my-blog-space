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

describe('GET /api/blog/myblogs', () => {
    test('Obtener lista de mis blogs', async () => {
        const res = await api
        .get('/api/blog/myblogs')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200)

        expect(res.body).toHaveProperty('blogs')
        expect(res.body.blogs.length).toBe(2)
    })
})

describe('GET /api/blog/user-blogs/:id', () => {
    test('Obtener lista de blogs de un usuario', async () => {
        const res = await api
        .get(`/api/blog/user-blogs/${users[1].id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

        expect(res.body).toHaveProperty('blogs')
        expect(res.body.blogs.length).toBe(1)
    })

    test('Obtener lista de blogs de un usuario estando bloqueado', async () => {

        // bloqueo usuario
        await api.patch(`/api/user/bloquear/${users[1].id}`).set('Authorization', `Bearer ${token}`)
        
        // intento ver blogs del usuario que me bloqueo
        const res = await api
        .get(`/api/blog/user-blogs/${users[0].id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(400)

        expect(res.body).toHaveProperty('mensaje')
        expect(res.body.mensaje).toBe(`${users[0].userName} te ha bloqueado`)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
}) 