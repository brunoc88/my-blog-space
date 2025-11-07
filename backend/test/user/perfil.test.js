const mongoose = require('mongoose')
const app = require('../../app')
const supertest = require('supertest')
const User = require('../../models/user')
const Blog = require('../../models/blog')
const Tag = require('../../models/tag')
const { MONGODB_URI } = require('../../utils/config')
const { loadUsers, getUsers } = require('../test_helper')
const { loadBlogs, getBlogs } = require('../fakeBlogs')
const { loadTags } = require('../dummy_tags')

const api = supertest(app)
// declaracion de variables globales
let users = null
let blogs = null
let token = null // token admin
let token2 = null // token admin


beforeAll(async () => {
    await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})
    await Tag.deleteMany({})
    await loadUsers()
    await loadTags()
    await loadBlogs('noTags')
    users = await getUsers()
    blogs = await getBlogs()

    const res = await api.post('/api/login').send({ user: users[0].userName, password: 'sekret' })
    const res2 = await api.post('/api/login').send({ user: users[1].userName, password: 'sekret' })

    token = res.body.token
    token2 = res2.body.token
})

describe('GET /api/user/miPerfil', () => {
    test('Informacion de mi perfil', async () => {

        // Agrego blogs a mi favoritos 
        // Ya que quiero ver mis blogs favoritos
        await api.patch(`/api/blog/${blogs[3].id}/fav`).set('Authorization', `Bearer ${token}`)
        await api.patch(`/api/blog/${blogs[0].id}/fav`).set('Authorization', `Bearer ${token}`)
        await api.patch(`/api/blog/${blogs[5].id}/fav`).set('Authorization', `Bearer ${token}`)


        // consulto mis datos
        const res = await api
            .get('/api/user/miPerfil')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
        expect(res.body).toHaveProperty('user')

    })
})

describe('GET /api/user/:id/perfil', () => {
    test('Ver el perfil de otro usuario', async () => {
        const res = await api
            .get(`/api/user/${users[1].id}/perfil`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        expect(res.body).toHaveProperty('user')
    })

    test('Ver el perfil de otro usuario estando bloqueado', async () => {
        // bloqueo al usuario 
        await api.patch(`/api/user/bloquear/${users[1].id}`).set('Authorization', `Bearer ${token}`)
        const res = await api
            .get(`/api/user/${users[0].id}/perfil`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(400)

        expect(res.body).toHaveProperty('mensaje')
        expect(res.body.mensaje).toBe(`${users[0].userName} te ha bloqueado`)
    })

    test('Ver el perfil de otro usuario que elimino su cuenta', async () => {
        // elimino cuenta
        await api.patch(`/api/user/${users[1].id}/suspender`).set('Authorization', `Bearer ${token2}`)
        
        // trato de ver perfil de usuario eliminado
        const res = await api
            .get(`/api/user/${users[1].id}/perfil`)
            .set('Authorization', `Bearer ${token}`)
            .expect(403)

        expect(res.body).toHaveProperty('mensaje')
        expect(res.body.mensaje).toBe('Cuenta eliminada')
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})