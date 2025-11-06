const app = require('../../app')
const mongoose = require('mongoose')
const supertest = require('supertest')
const Tag = require('../../models/tag')
const User = require('../../models/user')
const api = supertest(app)
const { MONGODB_URI } = require('../../utils/config')
const { loadUsers, getUsers } = require('../test_helper')
const { loadTags, getTags } = require('../dummy_tags')

let users = null
let token = null
let token2 = null
let tags = null

beforeAll(async () => {
    await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
    await Tag.deleteMany({})
    await User.deleteMany({})
    await loadUsers()
    users = await getUsers()
    await loadTags()
    tags = await getTags()
    const res = await api.post('/api/login').send({ user: users[0].userName, password: 'sekret' })
    const res2 = await api.post('/api/login').send({ user: users[1].userName, password: 'sekret' })

    token = res.body.token
    token2 = res2.body.token
})

describe('GET /api/tag/lista', () => {
    test('Obtener lista de etiquetas', async () => {
        const res = await api
            .get('/api/tag/lista')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        expect(res.body).toHaveProperty('etiquetas')
    })

    test('Obtener lista de etiquetas no siendo admin', async () => {
        const res = await api
            .get('/api/tag/lista')
            .set('Authorization', `Bearer ${token2}`)
            .expect(403)

        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toBe('Acceso denegado: permisos insuficientes')
    })
})

afterAll(async () => {
    await mongoose.connection.close()
}) 
