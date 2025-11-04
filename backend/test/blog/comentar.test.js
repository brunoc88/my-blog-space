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

describe('POST /api/blog/:id/comentar', () => {
    test('Realizar un comentario', async () => {
        const mensaje = 'Muy buen blog, muy interesante!'

        const res = await api
            .post(`/api/blog/${blogs[0].id}/comentar`)
            .send({ mensaje })
            .set('Authorization', `Bearer ${token2}`)
            .expect(201)

        // Verificamos que el backend devolvió el comentario con populate
        expect(res.body).toHaveProperty('comentario')
        expect(res.body.comentario).toHaveProperty('mensaje')
        expect(res.body.comentario).toHaveProperty('usuario')
        expect(res.body.comentario.usuario).toHaveProperty('userName')
        expect(res.body.comentario.usuario).toHaveProperty('imagen')

        // Verificamos que se guardó realmente en la base de datos
        const blog = await Blog.findById(blogs[0].id).populate('comentarios.usuario', 'username imagen')

        // último comentario guardado
        const ultimoComentario = blog.comentarios[blog.comentarios.length - 1]

        expect(ultimoComentario.mensaje).toBe(mensaje.toLowerCase())
        expect(ultimoComentario.usuario).toBeDefined()

    })

    describe('Validaciones', () => {
        test('Comentario vacio', async () => {
            const res = await api
                .post(`/api/blog/${blogs[0].id}/comentar`)
                .send({ mensaje: '' })
                .set('Authorization', `Bearer ${token2}`)
                .expect(400)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('Escriba un comentario')
        })

        test('Realizar comentario estando bloqueados', async () => {
            // Act: Bloqueamos al usuario que va a comentar
            await api.patch(`/api/user/bloquear/${users[1].id}`).set('Authorization', `Bearer ${token}`)

            const res = await api
                .post(`/api/blog/${blogs[0].id}/comentar`)
                .send({ mensaje: 'Muy buen blog!' })
                .set('Authorization', `Bearer ${token2}`)
                .expect(400)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe(`${users[0].userName} te ha bloqueado`)
        })

        test('Realizar comentario a blog privado', async () => {
           
            const res = await api
                .post(`/api/blog/${blogs[1].id}/comentar`)
                .send({ mensaje: 'Muy buen blog!' })
                .set('Authorization', `Bearer ${token}`)
                .expect(400)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('El blog es privado')
        })

        test('Realizar comentario a blog publico pero con comentarios deshabilitados', async () => {
           
            const res = await api
                .post(`/api/blog/${blogs[3].id}/comentar`)
                .send({ mensaje: 'Muy buen blog!' })
                .set('Authorization', `Bearer ${token}`)
                .expect(400)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('El autor deshabilito los comentarios')
        })
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})  