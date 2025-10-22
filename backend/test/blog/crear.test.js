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

describe('POST /api/blog/crear', () => {
    describe('Postear blog ', () => {
        test.only('Blog sin imagen', async () => {
            let blog = {
                titulo: 'Nuevo Resident Evil',
                nota: 'CapCom acaba de hacer publico los avances del nuevo Resident Evil Requiem',
                autor: users[0].id,
                visibilidad: true,
                tags: [tags[0].id, tags[1].id],
                permitirComentarios: true
            }

            const res = await api
                .post('/api/blog/crear')
                .set('Authorization', `Bearer ${token}`)
                .send(blog)
                .expect(201)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body).toHaveProperty('blog')
            expect(res.body.mensaje).toContain('Blog creado')
            expect(res.body.blog.titulo).toBe(blog.titulo)
            expect(res.body.blog.nota).toBe(blog.nota)
            expect(res.body.blog.visibilidad).toBe(true)
            expect(res.body.blog.tags).toEqual(
                expect.arrayContaining(blog.tags)
            )
        })
    })
})
afterAll(async () => {
    await mongoose.connection.close()
})  