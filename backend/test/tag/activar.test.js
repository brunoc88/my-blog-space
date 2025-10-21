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

describe('PATCH /api/tag/activar/:id', () => {
    test('Activar etiqueta correctaente', async () => {
        const res = await api
            .patch(`/api/tag/activar/${tags[2].id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        expect(res.body).toHaveProperty('mensaje')
        expect(res.body.mensaje).toBe('Etiqueda habilitada')
    })

    test('Activar etiqueta ya activada', async () => {
        const res = await api
            .patch(`/api/tag/activar/${tags[0].id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(403)

        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toBe('Etiqueda ya habilitada')
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})  