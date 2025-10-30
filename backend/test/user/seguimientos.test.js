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
let token3 = null // token admin 2
let token4 = null // token user comun 2

beforeAll(async () => {
    await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
    await User.deleteMany({})
    await loadUsers()
    users = await getUsers()
    const res = await api.post('/api/login').send({ user: users[0].userName, password: 'sekret' })
    const res2 = await api.post('/api/login').send({ user: users[1].userName, password: 'sekret' })
    const res3 = await api.post('/api/login').send({ user: users[3].userName, password: 'sekret' })
    const res4 = await api.post('/api/login').send({ user: users[3].userName, password: 'sekret' })

    token = res.body.token
    token2 = res2.body.token
    token3 = res3.body.token
    token4 = res4.body.token
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
})

afterAll(async () => {
    await mongoose.connection.close()
})  