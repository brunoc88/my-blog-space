const app = require('../../app')
const mongoose = require('mongoose')
const supertest = require('supertest')
const User = require('../../models/user')
const api = supertest(app)
const { MONGODB_URI } = require('../../utils/config')
const { loadUsers, getUsers } = require('../test_helper')

// declaracion de variables globales
let users = null
let token = null // token admin
let token2 = null // token user comun privada


beforeAll(async () => {
    await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
    await User.deleteMany({})
    await loadUsers()
    users = await getUsers()
    const res = await api.post('/api/login').send({ user: users[0].userName, password: 'sekret' })
    const res2 = await api.post('/api/login').send({ user: users[1].userName, password: 'sekret' })
    
    token = res.body.token
    token2 = res2.body.token
    
})

describe('PATCH /api/user/seguir/:id', () => {
    describe('Seguimientos sin bloqueos', () =>{
        test('Cuenta publica a publica', async () => {
            let userFollowersBefore = users[4].seguidores.length // Seguidores antes del usuario
            let miFollowingBefore = users[0].seguidos.length // Mis seguidos antes de seguir al usuario

            
            const res = await api
            .patch(`/api/user/seguir/${users[4].id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

            const yo = await User.findById(users[0].id)
            const user = await User.findById(users[4].id)
            const miFollowingAfter = yo.seguidos.length
            const userFollowersAfter = user.seguidores.length

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe(`Ahora sigues a ${users[4].userName}`)
            expect(miFollowingAfter).toBe(miFollowingBefore + 1)
            expect(userFollowersAfter).toBe(userFollowersBefore + 1)
            
        })

        test('Cuenta publica a privada', async () => {
            const userSolicitudesBefore = users[1].solicitudes.length
            const misSeguidosBefore = users[0].seguidos.length

            const res = await api
            .patch(`/api/user/seguir/${users[1].id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

            const yo = await User.findById(users[0].id)
            const user = await User.findById(users[1].id)

            
            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('Tu solicitud fue enviada')
            expect(yo.seguidos.length).toBe(misSeguidosBefore)
            expect(user.solicitudes.length).toBe(userSolicitudesBefore + 1)
        })
    })

    describe('Seguimientos con bloqueo', () => {
        test('Seguir una cuenta que nos bloqueo', async () => {
            // Bloqueamos una cuenta no admin y activa
            await api
            .patch(`/api/user/bloquear/${users[1].id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

            // Seguimos cuenta
            const res = await api
            .patch(`/api/user/seguir/${users[0].id}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(400)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe(`${users[0].userName} te ha bloqueado`)

        })

        test('Seguir cuenta que ya seguiamos', async () => {
            await api
            .patch(`/api/user/seguir/${users[0].id}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(200)

            // volvemos a seguir

            const res = await api
            .patch(`/api/user/seguir/${users[0].id}`)
            .set('Authorization', `Bearer ${token2}`)
            .expect(400)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('Ya sigues esta cuenta')
        })

        test('Seguirse a si mismo', async () => {
            const res = await api
            .patch(`/api/user/seguir/${users[0].id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(400)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('No puedes seguirte a ti mismo')
        })
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})  