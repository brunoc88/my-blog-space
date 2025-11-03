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
let token2 = null // token user comun


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

describe('PATCH /api/user/solicitud/aceptar/:id', () => {
    describe('Solicitud valida', () => {
        test('Aceptar solicitud', async () => {
            //  Arrange (preparamos los datos)
            const requesterId = users[0].id        // Usuario que envía la solicitud
            const targetId = users[1].id           // Usuario con cuenta privada (recibe la solicitud)

            const targetBefore = await User.findById(targetId)
            const requesterBefore = await User.findById(requesterId)

            const followersBefore = targetBefore.seguidores.length
            const requestsBefore = targetBefore.solicitudes.length
            const followingBefore = requesterBefore.seguidos.length

            // Act (acción: enviar solicitud)
            await api
                .patch(`/api/user/seguir/${targetId}`)
                .set('Authorization', `Bearer ${token}`) // token del solicitante
                .expect(200)


            // Act (acción: aceptar solicitud)
            const res = await api
                .patch(`/api/user/solicitud/aceptar/${requesterId}`)
                .set('Authorization', `Bearer ${token2}`) // token del usuario que recibe y acepta
                .expect(200)

            // verificamos resultados
            const targetAfter = await User.findById(targetId)
            const requesterAfter = await User.findById(requesterId)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe(`${users[0].userName} ahora te sigue`)

            // El seguidor aumenta en 1
            expect(targetAfter.seguidores.length).toBe(followersBefore + 1)

            // El solicitante ahora sigue a su objetivo
            expect(requesterAfter.seguidos.length).toBe(followingBefore + 1)

            // La solicitud fue eliminada
            expect(targetAfter.solicitudes.length).toBe(requestsBefore)
        })
    })
})

describe('PATCH /api/user/solicitud/rechazar/:id', () => {
    test('Rechazar solicitud', async () => {
        //  Arrange (preparamos los datos)
        const requesterId = users[0].id        // Usuario que envía la solicitud
        const targetId = users[1].id           // Usuario con cuenta privada (recibe la solicitud)

        const targetBefore = await User.findById(targetId)
        const requesterBefore = await User.findById(requesterId)

        const followersBefore = targetBefore.seguidores.length
        const requestsBefore = targetBefore.solicitudes.length
        const followingBefore = requesterBefore.seguidos.length

        // Act (acción: enviar solicitud)
        await api
            .patch(`/api/user/seguir/${targetId}`)
            .set('Authorization', `Bearer ${token}`) // token del solicitante
            .expect(200)

        // Act (acción: rechazar solicitud)
        const res = await api
            .patch(`/api/user/solicitud/rechazar/${requesterId}`)
            .set('Authorization', `Bearer ${token2}`) // token del usuario que recibe y rechaza
            .expect(200)

        // verificamos resultados
        const targetAfter = await User.findById(targetId)
        const requesterAfter = await User.findById(requesterId)

        expect(res.body).toHaveProperty('mensaje')
        expect(res.body.mensaje).toBe(`Haz rechazado la solicitud de ${users[0].userName}`)

        // El numero de seguidores sigue igual
        expect(targetAfter.seguidores.length).toBe(followersBefore)

        // El solicitante sigue teniendo el mismo numero de seguidos
        expect(requesterAfter.seguidos.length).toBe(followingBefore)

        // La solicitud fue eliminada
        expect(targetAfter.solicitudes.length).toBe(requestsBefore)
    })
})

describe('Validaciones', () => {
    test('Usuario suspende su cuenta', async () => {
        const requesterId = users[0].id        // Usuario que envía la solicitud
        const targetId = users[1].id           // Usuario con cuenta privada (recibe la solicitud)

        // mandamos solicitud
        await api
            .patch(`/api/user/seguir/${targetId}`)
            .set('Authorization', `Bearer ${token}`) // token del solicitante
            .expect(200)


        // luego el usuario solicitante elimina su cuenta
        await api.patch(`/api/user/${requesterId}/suspender`).set('Authorization', `Bearer ${token}`)

        // el usuario solicitado intenta aceptar solicitud

        const res = await api
            .patch(`/api/user/solicitud/aceptar/${requesterId}`)
            .set('Authorization', `Bearer ${token2}`) // token del usuario que recibe y acepta
            .expect(403)

        expect(res.body.mensaje).toBe('Cuenta eliminada')
    })

    test('Usuario bloquea despues de solicitar seguir', async () => {
        const requesterId = users[0].id        // Usuario que envía la solicitud
        const targetId = users[1].id           // Usuario con cuenta privada (recibe la solicitud)

        // mandamos solicitud
        await api
            .patch(`/api/user/seguir/${targetId}`)
            .set('Authorization', `Bearer ${token}`) // token del solicitante
            .expect(200)


        // luego el usuario solicitante bloquea al usuario que mando solicitud
        await api.patch(`/api/user/bloquear/${targetId}`).set('Authorization', `Bearer ${token}`)

        // el usuario solicitado intenta aceptar solicitud

        const res = await api
            .patch(`/api/user/solicitud/aceptar/${requesterId}`)
            .set('Authorization', `Bearer ${token2}`) // token del usuario que recibe y acepta
            .expect(400)

        expect(res.body.mensaje).toBe(`${users[0].userName} te ha bloqueado`)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})  