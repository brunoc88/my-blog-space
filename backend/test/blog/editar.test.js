const app = require('../../app')
const mongoose = require('mongoose')
const supertest = require('supertest')
const Tag = require('../../models/tag')
const User = require('../../models/user')
const Blog = require('../../models/blog')
const api = supertest(app)
const { MONGODB_URI } = require('../../utils/config')
const { loadUsers, getUsers } = require('../test_helper')
const { getTags } = require('../dummy_tags')
const { loadBlogs, getBlogs } = require('../fakeBlogs')


let users = null
let token = null
let token2 = null
let tags = null
let blogs = null

beforeAll(async () => {
    await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
    await Tag.deleteMany({})
    await User.deleteMany({})
    await Blog.deleteMany({})
    await loadUsers()
    await loadBlogs()
    users = await getUsers()
    blogs = await getBlogs()
    tags = await getTags()

    const res = await api.post('/api/login').send({ user: users[0].userName, password: 'sekret' })
    const res2 = await api.post('/api/login').send({ user: users[1].userName, password: 'sekret' })

    token = res.body.token
    token2 = res2.body.token
})

describe('PUT /api/blog/editar/:id', () => {
    test('Editar blog', async () => {

        let titleBefore = blogs[0].titulo
        let tagsBefore = blogs[0].tags[0].id
        let visibilidadBefore = blogs[0].visibilidad

        let blog = {
            titulo: 'Resident Evil zero remake',
            tags: [tags[1].id],
            visibilidad: 'privado'
        }

        const res = await api
            .put(`/api/blog/editar/${blogs[0].id}`)
            .send(blog)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        expect(res.body).not.toBeNull()
        expect(res.body).toHaveProperty('mensaje')
        expect(res.body).toHaveProperty('blog')
        expect(res.body.mensaje).toBe('Blog actualizado')
        expect(res.body.blog.titulo).toBe('Resident Evil zero remake')
        expect(res.body.blog.titulo).not.toBe(titleBefore)
        expect(res.body.blog.tags).toContain(tags[1].id)
        expect(res.body.blog.tags).not.toContain(tagsBefore)
        expect(res.body.blog.visibilidad).not.toBe(visibilidadBefore)
    })

    test('Editar blog no siendo el autor', async () => {

        let blog = {
            titulo: 'Resident Evil zero remake'
        }

        const res = await api
            .put(`/api/blog/editar/${blogs[0].id}`)
            .send(blog)
            .set('Authorization', `Bearer ${token2}`)
            .expect(403)

        expect(res.body).not.toBeNull()
        expect(res.body).toHaveProperty('mensaje')
        expect(res.body.mensaje).toBe('No tienes permiso para realizar esta acción')
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})  