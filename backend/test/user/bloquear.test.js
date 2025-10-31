const mongoose = require('mongoose')
const app = require('../../app')
const supertest = require('supertest')
const User = require('../../models/user')
const { MONGODB_URI } = require('../../utils/config')
const { loadUsers, getUsers } = require('../test_helper')
const api = supertest(app)
// declaracion de variables globales
let users = null
let token = null // token admin
let tokenUserComun = null
let tokenUserComun2 = null
let tokenUserComun3 = null

beforeAll(async () => {
    await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
    await User.deleteMany({})
    await loadUsers()
    users = await getUsers()

    const res = await api.post('/api/login').send({ user: users[0].userName, password: 'sekret' })
    const res2 = await api.post('/api/login').send({ user: users[1].userName, password: 'sekret' })
    const res3 = await api.post('/api/login').send({ user: users[4].userName, password: 'sekret' })

    token = res.body.token
    tokenUserComun = res2.body.token
    tokenUserComun2 = res3.body.token
})

describe('PATCH /api/user/bloquear/:id', () => {
    describe('Bloquear usuario', () => {
        test('Usuario admin a usuario comun', async () => {
            const myBlocksBefore = users[0].bloqueos.length

            const res = await api
                .patch(`/api/user/bloquear/${users[1].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            // check mis bloqueos despues
            const myUser = await User.findById(users[0].id)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('Usuario bloqueado')
            expect(myUser.bloqueos.length).toBe(myBlocksBefore + 1)

        })

        test('Usuario comun a usuario comun', async () => {

            const res = await api
                .patch(`/api/user/bloquear/${users[4].id}`)
                .set('Authorization', `Bearer ${tokenUserComun}`)
                .expect(200)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('Usuario bloqueado')
        })
    })
    describe('Verficaciones', () => {
        test('Bloquear cuenta eliminada', async () => {
            const res = await api
                .patch(`/api/user/bloquear/${users[2].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(403)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('Cuenta eliminada')
        })

        test('Bloquear cuenta ya bloqueada', async () => {
            await api
                .patch(`/api/user/bloquear/${users[1].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200)

            const res = await api
                .patch(`/api/user/bloquear/${users[1].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(400)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe(`Tienes bloqueado a ${users[1].userName}`)
        })

        test('Bloquear cuenta que me tiene bloqueado', async () => {
            // Hacemos que la cuenta a bloquear nos bloquee primero
            await api
                .patch(`/api/user/bloquear/${users[1].id}`)
                .set('Authorization', `Bearer ${tokenUserComun2}`)
                .expect(200)

            const res = await api
                .patch(`/api/user/bloquear/${users[4].id}`)
                .set('Authorization', `Bearer ${tokenUserComun}`)
                .expect(400)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe(`${users[4].userName} te ha bloqueado`)
        })

        test('Bloquear cuenta no encontrada', async () => {
            let fakeId = new mongoose.Types.ObjectId()

            const res = await api
                .patch(`/api/user/bloquear/${fakeId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('Cuenta no encontrada')

        })
    })
    describe('Permisos', () => {
        test('Bloquearse a si mismo', async () => {
            const res = await api
                .patch(`/api/user/bloquear/${users[0].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(400)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('No puedes bloquearte a ti mismo')
        })

        test('Bloqueo entre admins', async () => {
            const res = await api
                .patch(`/api/user/bloquear/${users[3].id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(400)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('No puedes bloquear a otro admin')
        })

        test('Bloqueo entre usuario comun a admin', async () => {
            const res = await api
                .patch(`/api/user/bloquear/${users[0].id}`)
                .set('Authorization', `Bearer ${tokenUserComun}`)
                .expect(400)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('No puedes bloquear a un admin')
        })
    })
})
afterAll(async () => {
    await mongoose.connection.close()
})