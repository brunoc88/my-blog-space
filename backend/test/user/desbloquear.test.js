const mongoose = require('mongoose')
const app = require('../../app')
const supertest = require('supertest')
const User = require('../../models/user')
const { MONGODB_URI } = require('../../utils/config')
const { loadUsers, getUsers } = require('../test_helper')
const api = supertest(app)
// declaracion de variables globales
let users = null
let token = null


beforeAll(async () => {
    await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
    await User.deleteMany({})
    await loadUsers()
    users = await getUsers()

    const res = await api.post('/api/login').send({ user: users[0].userName, password: 'sekret' })
    token = res.body.token
})

describe('PATCH /api/user/desbloquear/:id', () => {
    describe('Verficaciones', () => {
        test('Desbloquear cuenta eliminada', async () => {
            const res = await api
                .patch(`/api/user/desbloquear/${users[2].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(403)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('Cuenta eliminada')
        })

        test('Desbloquear cuenta que no estaba bloqueada', async () => {
            const res = await api
                .patch(`/api/user/desbloquear/${users[1].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('El usuario no está en tu lista de bloqueos')
        })
    })

    test('Desbloquar cuenta', async () => {
        // Bloqueamos una cuenta no admin y activa
        await api
        .patch(`/api/user/bloquear/${users[1].id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

        // Luego pasamos a desbloquear

        const res = await api
        .patch(`/api/user/desbloquear/${users[1].id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

        expect(res.body).toHaveProperty('mensaje')
        expect(res.body.mensaje).toBe(`Has desbloqueado a ${users[1].userName}`)
    })
})
afterAll(async () => {
    await mongoose.connection.close()
})