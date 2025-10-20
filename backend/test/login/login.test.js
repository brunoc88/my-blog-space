const app = require('../../app')
const mongoose = require('mongoose')
const supertest = require('supertest')
const User = require('../../models/user')
const api = supertest(app)
const { MONGODB_URI } = require('../../utils/config')
const { loadUsers, getUsers } = require('../test_helper')
let users = null


beforeAll(async () => {
    await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
    await User.deleteMany({})
    await loadUsers()
    users = await getUsers()
})

describe('POST /api/login', () => {
    describe('Login valido', () => {
        test('Login exitoso', async () => {
            const res = await api
                .post('/api/login')
                .send({ user: users[0].userName, password: 'sekret' })
                .expect(200)

            expect(res.body).not.toBeNull()
            expect(res.body).toHaveProperty('msj')
            expect(res.body).toHaveProperty('user')
            expect(res.body).toHaveProperty('token')
            expect(res.body.msj).toContain('Login exitoso!')
        })

    })

    describe('Validaciones de login', () => {
        test('Login con cuenta suspendida', async () => {

            const user = users[2]

            const res = await api
                .post('/api/login')
                .send({ user: user.userName, password: 'sekret' })
                .expect(404)

            expect(res.body).toHaveProperty('error')
            expect(res.body.error).toHaveProperty('invalid')
            expect(res.body.error.invalid).toBe('Cuenta inexistente o suspendida')
        })

        test('Falta de username o email', async () => {

            const res = await api
                .post('/api/login')
                .send({ user: '', password: 'sekret' })
                .expect(400)

            expect(res.body).toHaveProperty('error')
            expect(res.body.error).toHaveProperty('user')
            expect(res.body.error.user).toBe('Ingrese un usuario o email')
        })

        test('Falta de password', async () => {

            const res = await api
                .post('/api/login')
                .send({ user: users[0].userName, password: '' })
                .expect(400)

            expect(res.body).toHaveProperty('error')
            expect(res.body.error).toHaveProperty('password')
            expect(res.body.error.password).toBe('Ingrese un password')
        })

        test('Password incorrecto', async () => {

            const res = await api
                .post('/api/login')
                .send({ user: users[0].userName, password: '123456' })
                .expect(400)

            expect(res.body).toHaveProperty('error')
            expect(res.body.error).toHaveProperty('password')
            expect(res.body.error.password).toBe('Password incorrecto')
        })
    })

})



afterAll(async () => {
    await mongoose.connection.close()
})  