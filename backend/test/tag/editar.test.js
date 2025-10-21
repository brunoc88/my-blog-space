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
let tags = null
let token = null
let token2 = null

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

describe('PATCH /api/tag/editar/:id', () => {
    test('Editar etiqueta activa' , async () => {
        const res = await api
        .patch(`/api/tag/editar/${tags[0].id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({nombre:'survivor'})
        .expect(200)

        expect(res.body).toHaveProperty('mensaje')
        expect(res.body).toHaveProperty('tag')
        expect(res.body.mensaje).toContain('Etiqueta actualizada')
        expect(res.body.tag.nombre).toBe('survivor')
    })

     test('Editar etiqueta inactiva' , async () => {
        const res = await api
        .patch(`/api/tag/editar/${tags[2].id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({nombre:'survivor'})
        .expect(403)

        expect(res.body).toHaveProperty('error')
        expect(res.body.error).toContain('Etiqueda desabilitada')
    })
})

afterAll(async () => {
    await mongoose.connection.close()
}) 