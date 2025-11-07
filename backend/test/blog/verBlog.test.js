const mongoose = require('mongoose')
const app = require('../../app')
const supertest = require('supertest')
const Blog = require('../../models/blog')
const User = require('../../models/user')
const Tag = require('../../models/tag')
const { loadUsers, getUsers } = require('../test_helper')
const { loadBlogs, getBlogs } = require('../fakeBlogs')
const { MONGODB_URI } = require('../../utils/config')
const api = supertest(app)
let users = null
let blogs = null
let token = null
let token2 = null


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

    token = res.body.token
    token2 = res2.body.token

})

describe('GET /api/blog/:id', () => {
    test('Ver blog', async () => {

        // cargo al blog con comentarios, likes de blog y like de comentario
        // Act: Cargo los comentarios
        await api
            .post(`/api/blog/${blogs[0].id}/comentar`)
            .send({ mensaje: 'Que gran blog de noticias' })
            .set('Authorization', `Bearer ${token2}`)
            .expect(201)

        await api
            .post(`/api/blog/${blogs[0].id}/comentar`)
            .send({ mensaje: 'Muchas gracias por el apoyo' })
            .set('Authorization', `Bearer ${token}`)
            .expect(201)

        // doy like comentario

        let blog = await Blog.findById(blogs[0].id)
        let commentId = blog.comentarios[0].id


        await api
            .patch(`/api/blog/${blogs[0].id}/comentar/${commentId}/like`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        const res = await api
            .get(`/api/blog/${blogs[0].id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        expect(res.body).toHaveProperty('blog')
        expect(res.body.blog).toHaveProperty('nota')
    })

    test('Ver blog estando bloqueados', async () => {
        // bloqueo al usuario
        await api.patch(`/api/user/bloquear/${users[1].id}`)
            .set('Authorization', `Bearer ${token}`)

        // Intentamos ver un blog del autor

        const res = await api
            .get(`/api/blog/${blogs[0].id}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(400)

        expect(res.body.mensaje).toBe(`${users[0].userName} te ha bloqueado`)
    })

    test('Ver blog privado siendo el autor', async () => {

        const res = await api
            .get(`/api/blog/${blogs[1].id}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(200)

        expect(res.body).toHaveProperty('blog')
    })

    test('Ver blog privado no siendo el autor', async () => {

        const res = await api
            .get(`/api/blog/${blogs[1].id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(403)

        expect(res.body).toHaveProperty('mensaje')
        expect(res.body.mensaje).toBe('Blog privado')
    })
})

afterAll(async () => {
    await mongoose.connection.close()
}) 