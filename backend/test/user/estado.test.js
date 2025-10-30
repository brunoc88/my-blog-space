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
let token2 = null // token user comun


beforeAll(async () => {
    await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
    await User.deleteMany({})
    await loadUsers()
    users = await getUsers()
    const res = await api.post('/api/login').send({ user: users[0].userName, password: 'sekret' })
    const res2 = await api.post('/api/login').send({ user: users[1].userName, password: 'sekret' })
    const res3 = await api.post('/api/login').send({ user: users[3].userName, password: 'sekret' })
    const res4 = await api.post('/api/login').send({ user: users[3].userName, password: 'sekret' })

    token = res.body.token
    token2 = res2.body.token
    token3 = res3.body.token
    token4 = res4.body.token
})

describe('PATCH /api/user/estado', () => {
    describe('Cambiar el estado de la cuenta', () => {
        test('Pasar de publica a privada', async () => {
            const res = await api
                .patch('/api/user/estado')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body).toHaveProperty('user')
            expect(res.body.mensaje).toBe('Tu cuenta ahora es privada')
            expect(res.body.user.estado).toBe(false)
        })

        test('Pasar de privada a publica', async () => {
            const res = await api
                .patch('/api/user/estado')
                .set('Authorization', `Bearer ${token2}`)
                .expect(200)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body).toHaveProperty('user')
            expect(res.body.mensaje).toBe('Tu cuenta ahora es publica')
            expect(res.body.user.estado).toBe(true)
        })
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})  