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



afterAll(async () => {
    await mongoose.connection.close()
})  