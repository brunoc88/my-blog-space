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

describe('PATCH /api/blog/:id/like', () => {
    describe('Like & dislike correcto', () => {
        test('Dar like a un blog', async () => {
            const target = await Blog.findById(blogs[0].id)
            const likesBefore = target.likes.length

            const res = await api
                .patch(`/api/blog/${blogs[0].id}/like`)
                .set('Authorization', `Bearer ${token2}`)
                .expect(200)

            const targetAfter = await Blog.findById(blogs[0].id)
            const likesAfter = targetAfter.likes.length

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('Like agregado')
            expect(likesAfter).toBe(likesBefore + 1)
        })

        test('Quitar like a un blog', async () => {
            const target = await Blog.findById(blogs[0].id)
            const likesBefore = target.likes.length

            // Act: Doy like primero
            await api
                .patch(`/api/blog/${blogs[0].id}/like`)
                .set('Authorization', `Bearer ${token2}`)
                .expect(200)


            // Act: Repito la accion
            const res = await api
                .patch(`/api/blog/${blogs[0].id}/like`)
                .set('Authorization', `Bearer ${token2}`)
                .expect(200)
            const targetAfter = await Blog.findById(blogs[0].id)
            const likesAfter = targetAfter.likes.length


            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('Like quitado')
            expect(likesAfter).toBe(likesBefore)
        })
    })
    describe('Validaciones', () => {
        test('Dar like a blog eliminado', async () => {
            const res = await api
                .patch(`/api/blog/${blogs[2].id}/like`)
                .set('Authorization', `Bearer ${token}`)
                .expect(403)

            expect(res.body.mensaje).toBe('Blog eliminado')
        })

        test('Dar like a blog privado', async () => {
            const res = await api
                .patch(`/api/blog/${blogs[1].id}/like`)
                .set('Authorization', `Bearer ${token}`)
                .expect(400)

            expect(res.body.mensaje).toBe('El blog es privado')
        })

        test('Dar like a blog donde el autor nos bloqueo', async () => {
            await api
                .patch(`/api/user/bloquear/${users[1].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            const res = await api
                .patch(`/api/blog/${blogs[0].id}/like`)
                .set('Authorization', `Bearer ${token2}`)
                .expect(400)

            expect(res.body.mensaje).toBe(`${users[0].userName} te ha bloqueado`)
        })

        test('Dar like a blog donde dimos dislike', async () => {
            // Act: Damos dislike
            await api
                .patch(`/api/blog/${blogs[0].id}/dislike`)
                .set('Authorization', `Bearer ${token2}`)
                .expect(200)

            // Act: Damos like
            const res = await api
                .patch(`/api/blog/${blogs[0].id}/like`)
                .set('Authorization', `Bearer ${token2}`)
                .expect(400)

            expect(res.body.mensaje).toBe('No puedes dar like si ya diste dislike')
        })
    })
})

describe('PARCH /api/blog/:id/dislike', () => {
    test('Dar dislike', async () => {
        const res = await api
            .patch(`/api/blog/${blogs[0].id}/dislike`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(200)

        expect(res.body.mensaje).toBe('Dislike agregado')
    })

    test('Quitar dislike', async () => {
        // Act: Damos dislike 
        await api
            .patch(`/api/blog/${blogs[0].id}/dislike`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(200)

        const blogBefore = await Blog.findById(blogs[0].id)
        
        // Act: Quitamos el dislike
        const res = await api
            .patch(`/api/blog/${blogs[0].id}/dislike`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(200)
        const blogAfter = await Blog.findById(blogs[0].id)
       
        expect(res.body.mensaje).toBe('Dislike quitado')
        expect(blogAfter.dislikes.length).toBe(blogBefore.dislikes.length - 1)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})  