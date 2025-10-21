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
let token3 = null // token admin 2
let token4 = null // token user comun 2

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

describe('PATCH /api/user/:id/suspender', () => {
    describe('Suspender mi cuenta con exito', () => {
        test('Como admin', async () => {
            let id = users[0].id

            const res = await api
                .patch(`/api/user/${id}/suspender`)
                .set('Authorization', `Bearer ${token}`) // mandamos el token
                .expect(200)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toContain('Cuenta suspendida')
        })

        test('Como usuario comun', async () => {
            let id = users[1].id

            const res = await api
                .patch(`/api/user/${id}/suspender`)
                .set('Authorization', `Bearer ${token2}`) // mandamos el token
                .expect(200)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toContain('Cuenta suspendida')
        })

        test('Usuario admin suspende usuario comun', async () => {
            let id = users[1].id

            const res = await api
                .patch(`/api/user/${id}/suspender`)
                .set('Authorization', `Bearer ${token}`) // mandamos el token
                .expect(200)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toContain('Cuenta suspendida')
        })
    })

    describe('Validaciones', () => {
        test('Usuario comun intentando suspender usuario admin', async () => {
            let id = users[0].id

            const res = await api
                .patch(`/api/user/${id}/suspender`)
                .set('Authorization', `Bearer ${token2}`) // mandamos el token
                .expect(403)

            expect(res.body).toHaveProperty('error')
            expect(res.body.error).toContain('No puedes suspender a un admin')
        })

        test('Usuario admin intentando suspender usuario admin', async () => {
            let id = users[0].id

            const res = await api
                .patch(`/api/user/${id}/suspender`)
                .set('Authorization', `Bearer ${token3}`) // mandamos el token
                .expect(403)

            expect(res.body).toHaveProperty('error')
            expect(res.body.error).toContain('Un admin no puede suspender a otro admin')
        })

        test('Usuario comun intentando suspender otro usuario comun', async () => {
            let id = users[4].id

            const res = await api
                .patch(`/api/user/${id}/suspender`)
                .set('Authorization', `Bearer ${token2}`) // mandamos el token
                .expect(403)

            expect(res.body).toHaveProperty('error')
            expect(res.body.error).toContain('No puedes suspender a otro usuario')
        })

        test('Usuario intentando suspender cuenta ya suspendida', async () => {
            let id = users[2].id

            const res = await api
                .patch(`/api/user/${id}/suspender`)
                .set('Authorization', `Bearer ${token}`) // mandamos el token
                .expect(403)

            expect(res.body).toHaveProperty('error')
            expect(res.body.error).toContain('Cuenta suspendida')
        })
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})  