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
let token3 = null


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
    const res3 = await api.post('/api/login').send({ user: users[8].userName, password: 'sekret' })

    token = res.body.token
    token2 = res2.body.token
    token3 = res3.body.token

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

describe('GET /api/blog/allblogs', () => {
    test('Obtener blog de usuarios seguidos', async () => {

        // sigo algunos usuarios activos y blogs activos
        // aqui no hay bloqueo de ningun lado

        await api
            .patch(`/api/user/seguir/${users[6].id}`) //fakeUser7
            .set('Authorization', `Bearer ${token2}`)

        await api
            .patch(`/api/user/seguir/${users[7].id}`) //fakeUser8
            .set('Authorization', `Bearer ${token2}`)

        await api
            .patch(`/api/user/seguir/${users[8].id}`) //fakeUser9
            .set('Authorization', `Bearer ${token2}`)

        // bloqueo a fakeUser8 
        await api
            .patch(`/api/user/bloquear/${users[7].id}`) //fakeUser8
            .set('Authorization', `Bearer ${token2}`)
            .expect(200)

        // fakeUser9 me bloquea
        await api
            .patch(`/api/user/bloquear/${users[1].id}`) //fakeUser2
            .set('Authorization', `Bearer ${token3}`) //fakeUser9
            .expect(200)

        // obtengo listado
        const res = await api
            .get('/api/blog/allblogs')
            .set('Authorization', `Bearer ${token2}`)
            .expect(200)

        const blogs = res.body.blogs

        // solo deberia devolver los blogs de fakeuser7
        // ya que es el unico que no fue bloqueado
        // como tampoco el me bloqueo a mi
        expect(blogs).toHaveLength(2)
        expect(blogs.map(b => b.autor.userName)).toEqual(['fakeuser7', 'fakeuser7'])
    })
})

describe('GET /api/blog/index', () => {
    test('Obtener blog de usuarios que no sigo', async () => {

        // sigo algunos usuarios activos y blogs activos
        // aqui no hay bloqueo de ningun lado

        await api
            .patch(`/api/user/seguir/${users[6].id}`) //fakeuser7
            .set('Authorization', `Bearer ${token2}`)

        await api
            .patch(`/api/user/seguir/${users[7].id}`) //fakeuser8
            .set('Authorization', `Bearer ${token2}`)

        await api
            .patch(`/api/user/seguir/${users[8].id}`) //fakeuser9
            .set('Authorization', `Bearer ${token2}`)

        // bloqueo a un fakeuser10 activo y blog activo
        await api
            .patch(`/api/user/bloquear/${users[9].id}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(200)

        // fakeuser me bloquea
        await api
            .patch(`/api/user/bloquear/${users[1].id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        // obtengo listado
        await api
            .get('/api/blog/index')
            .set('Authorization', `Bearer ${token2}`)
            .expect(200)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
}) 