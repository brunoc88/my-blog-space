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

describe('PUT /api/user/editar', () => {
    describe('Editando cuenta', () => {
        test('Cambiar Email', async () => {

            const res = await api
                .put('/api/user/editar')
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'brunoc88@gmail.com' })
                .expect(200)

            expect(res.body).not.toBeNull()
            expect(res.body).toHaveProperty('mensaje')
            expect(res.body).toHaveProperty('user')
            expect(res.body.mensaje).toContain('Datos acuatilzados')
            expect(res.body.user.email).toBe('brunoc88@gmail.com')
            expect(res.body.user).toMatchObject({
                email: 'brunoc88@gmail.com'
            })
        })

        test('Cambiar username', async () => {

            const res = await api
                .put('/api/user/editar')
                .set('Authorization', `Bearer ${token}`)
                .send({ userName: 'brunoc88' })
                .expect(200)

            expect(res.body).not.toBeNull()
            expect(res.body).toHaveProperty('mensaje')
            expect(res.body).toHaveProperty('user')
            expect(res.body.user).toHaveProperty('userName')
            expect(res.body.mensaje).toContain('Datos acuatilzados')
            expect(res.body.user.userName).toBe('brunoc88')
        })

        test('Cambiar password', async () => {

            const res = await api
                .put('/api/user/editar')
                .set('Authorization', `Bearer ${token}`)
                .send({ password: '123456', password2:'123456' })
                .expect(200)

            expect(res.body).not.toBeNull()
            expect(res.body).toHaveProperty('mensaje')
            expect(res.body).toHaveProperty('user')
            expect(res.body.user).toHaveProperty('password')
            expect(res.body.mensaje).toContain('Datos acuatilzados')
        })
    })
})
afterAll(async () => {
    await mongoose.connection.close()
}) 