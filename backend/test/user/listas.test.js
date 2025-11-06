const mongoose = require('mongoose')
const app = require('../../app')
const supertest = require('supertest')
const User = require('../../models/user')
const { MONGODB_URI } = require('../../utils/config')
const { loadUsers, getUsers } = require('../test_helper')
const api = supertest(app)
// declaracion de variables globales
let users = null
let token = null // token admin
let token2 = null // cuenta privada

beforeAll(async () => {
    await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
    await User.deleteMany({})
    await loadUsers()
    users = await getUsers()

    const res = await api.post('/api/login').send({ user: users[0].userName, password: 'sekret' })
    const res2 = await api.post('/api/login').send({ user: users[1].userName, password: 'sekret' })

    token = res.body.token
    token2 = res2.body.token
})

describe('GET /api/user/bloqueados', () => {
    test('Obtener lista de bloqueados', async () => {
        // bloqueo
        await api.patch(`/api/user/bloquear/${users[1].id}`).set('Authorization', `Bearer ${token}`)
        await api.patch(`/api/user/bloquear/${users[4].id}`).set('Authorization', `Bearer ${token}`)

        // consulto
        const res = await api
            .get('/api/user/bloqueados')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        expect(res.body).toHaveProperty('bloqueados')
        expect(res.body).toHaveProperty('cantidad')
        expect(res.body.cantidad).toBe(2)
        // uno de los usuarios bloqueados elimina su cuenta 
        await api.patch(`/api/user/${users[1].id}/suspender`).set('Authorization', `Bearer ${token}`)

        // consulto de vuelta
        const res2 = await api
            .get('/api/user/bloqueados')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
        expect(res2.body.cantidad).toBe(1)
    })
})

describe('GET /api/user/solicitudes', () => {
    test('Obtener lista de solicitudes', async () => {
        // Mandamos solicitud a cuenta privada
        await api.patch(`/api/user/seguir/${users[1].id}`).set('Authorization', `Bearer ${token}`)

        // Consultamos solicitudes

        const res = await api
            .get('/api/user/solicitudes')
            .set('Authorization', `Bearer ${token2}`)
            .expect(200)

        expect(res.body).toHaveProperty('cantidad')
        expect(res.body).toHaveProperty('solicitudes')
        expect(res.body.cantidad).toBe(1)
    })
})

describe('GET /api/user/seguidos', () => {
    test('Lista de seguidos', async () => {
        // seguir una cuenta
        await api.patch(`/api/user/seguir/${users[0].id}`).set('Authorization', `Bearer ${token2}`)

        // consulto mi lista de seguidos
        const res = await api
        .get(`/api/user/seguidos`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200)

        expect(res.body).toHaveProperty('seguidos')
        expect(res.body).toHaveProperty('cantidad')
        expect(res.body.cantidad).toBe(1)
    })
})

describe('GET /api/user/seguidores', () => {
    test('Lista de seguidores', async () => {
        // seguir una cuenta
        await api.patch(`/api/user/seguir/${users[0].id}`).set('Authorization', `Bearer ${token2}`)

        // consulto mi lista de seguidores
        const res = await api
        .get(`/api/user/seguidores`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

        expect(res.body).toHaveProperty('seguidores')
        expect(res.body).toHaveProperty('cantidad')
        expect(res.body.cantidad).toBe(1)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})