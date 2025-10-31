const app = require('../../app')
const mongoose = require('mongoose')
const supertest = require('supertest')
const User = require('../../models/user')
const api = supertest(app)
const { MONGODB_URI } = require('../../utils/config')
const { loadUsers, getUsers } = require('../test_helper')

// declaracion de variables globales
let users = null
let token = null // token admin
let token2 = null // token user comun privada


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

describe('PATCH /api/user/noSeguir/:id', () => {
    test('Dejar de seguir alguien que nunca segui', async () => {
        const res = await api
            .patch(`/api/user/noSeguir/${users[1].id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404)

        expect(res.body).toHaveProperty('mensaje')
        expect(res.body.mensaje).toBe('El usuario no está en tu lista de seguidos')
    })

    test('Dejar de seguir alguien', async () => {
        const myUserBefore = await User.findById(users[0].id)
        const misSeguidosAntes = myUserBefore.seguidos.length
        

        // Seguimos cuenta publica porque sino se guarda en solicitudes
        await api
        .patch(`/api/user/seguir/${users[3].id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

        const res = await api
            .patch(`/api/user/noSeguir/${users[3].id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        const myUserAfter = await User.findById(users[0].id)
        expect(res.body).toHaveProperty('mensaje')
        expect(res.body.mensaje).toBe(`Has dejado de seguir a ${users[3].userName}`)
        expect(myUserAfter.seguidos.length).toBe(misSeguidosAntes)
        
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})  