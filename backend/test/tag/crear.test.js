const app = require('../../app')
const mongoose = require('mongoose')
const supertest = require('supertest')
const Tag = require('../../models/tag')
const User = require('../../models/user')
const api = supertest(app)
const { MONGODB_URI } = require('../../utils/config')
const { loadUsers, getUsers } = require('../test_helper')

let users = null
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

    const res = await api.post('/api/login').send({ user: users[0].userName, password: 'sekret' })
    const res2 = await api.post('/api/login').send({ user: users[1].userName, password: 'sekret' })

    token = res.body.token
    token2 = res2.body.token
})

describe('POST /api/tag/crear', () => {
    describe('Creacion exitosa', () => {
        test('Forma correcta', async () => {
            const res = await api
                .post('/api/tag/crear')
                .set('Authorization', `Bearer ${token}`)
                .send({ nombre: 'Horror' })
                .expect(201)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body).toHaveProperty('tag')
            expect(res.body.mensaje).toContain('Etiqueta creada con éxito')
        })
    })

    describe('Validaciones', () => {
        test('Nombre vacio', async () => {
            const res = await api
                .post('/api/tag/crear')
                .set('Authorization', `Bearer ${token}`)
                .send({ nombre: '' })
                .expect(400)

            expect(res.body).toHaveProperty('error')
            expect(res.body.error).toContain('Debe ingresar un nombre')
        })

        test('Nombre menor a 2 caracteres', async () => {
            const res = await api
                .post('/api/tag/crear')
                .set('Authorization', `Bearer ${token}`)
                .send({ nombre: 'a' })
                .expect(400)

            expect(res.body).toHaveProperty('error')
            expect(res.body.error).toContain('El nombre debe tener al menos 2 caracteres')
        })

        test('Nombre con mal formato', async () => {
            const res = await api
                .post('/api/tag/crear')
                .set('Authorization', `Bearer ${token}`)
                .send({ nombre: 'react!' })
                .expect(400)

            expect(res.body).toHaveProperty('error')
            expect(res.body.error).toContain('El nombre solo puede contener letras, números, espacios y guiones')
        })

        test('Crear etiqueta con usuario comun', async () => {
            const res = await api
                .post('/api/tag/crear')
                .set('Authorization', `Bearer ${token2}`)
                .send({ nombre: 'Resident Evil' })
                .expect(403)

            expect(res.body).toHaveProperty('error')
            expect(res.body.error).toContain('Acceso denegado: permisos insuficientes')
        })
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})  