const mongoose = require('mongoose')
const app = require('../../app')
const supertest = require('supertest')
const Blog = require('../../models/blog')
const User = require('../../models/user')
const Tag = require('../../models/tag')
const { loadUsers, getUsers } = require('../test_helper')
const { loadBlogs, getBlogs } = require('../fakeBlogs')
const { loadTags, getTags } = require('../dummy_tags')
const { MONGODB_URI } = require('../../utils/config')
const api = supertest(app)
let users = null
let blogs = null
let token = null
let tokenUserComun2 = null
let tokenAdmin = null


beforeAll(async () => {
    await mongoose.connect(MONGODB_URI)
})


beforeEach(async () => {
    // limpiamos db
    await Blog.deleteMany({})
    await User.deleteMany({})
    await Tag.deleteMany({})

    // cargamos db
    await loadUsers()
    await loadBlogs()
    //await loadTags()

    // guardamos users & blogs
    users = await getUsers()
    blogs = await getBlogs()

    // logueamos un usuario comun y un usuario admin

    const res = await api.post('/api/login').send({ user: users[0].userName, password: 'sekret' })
    const res2 = await api.post('/api/login').send({ user: users[1].userName, password: 'sekret' })
    const res3 = await api.post('/api/login').send({ user: users[4].userName, password: 'sekret' })

    token = res2.body.token
    tokenUserComun2 = res3.body.token
    tokenAdmin = res.body.token

})

describe('PATCH /api/blog/eliminar', () => {
    describe('Blog no encontrado o ya eliminado', () => {

        test('No se encontro blog', async () => {
            const fakeId = new mongoose.Types.ObjectId()

            const res = await api
                .patch(`/api/blog/eliminar/${fakeId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404)

            expect(res.body.mensaje).toBe('No se encontró blog')
        })

        test('Blog ya eliminado', async () => {

            const res = await api
                .patch(`/api/blog/eliminar/${blogs[2].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(400)

            expect(res.body.mensaje).toBe('El blog ya se encuentra eliminado')
        })
    })

    describe('Eliminar blog', () => {
        test('Eliminar blog con autor admin siendo user comun', async () => {

            const res = await api
                .patch(`/api/blog/eliminar/${blogs[0].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(403)

            expect(res.body.mensaje).toBe('No tienes permiso para realizar esta acción')
        })

        test('Eliminar blog siendo diferente us', async () => {

            const res = await api
                .patch(`/api/blog/eliminar/${blogs[0].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(403)

            expect(res.body.mensaje).toBe('No tienes permiso para realizar esta acción')
        })
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})  