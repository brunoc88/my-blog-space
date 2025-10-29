const app = require('../../app')
const mongoose = require('mongoose')
const supertest = require('supertest')
const User = require('../../models/user')
const api = supertest(app)
const { MONGODB_URI } = require('../../utils/config')
const { loadUsers, getUsers } = require('../test_helper')

// declaracion de variables globales
let users = null


beforeAll(async () => {
    await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
    await User.deleteMany({})
    await loadUsers()
    users = await getUsers()
})

describe('POST /api/user/recuperar-password', () => {
    describe('Validaciones de formato', () => {
        test('Email, pregunta, respuesta', async () => {
            let recovery = {
                email: 'bruno',
                pregunta: '',
                respuesta: ''
            }

            const res = await api
                .post('/api/user/recuperar-password')
                .send(recovery)
                .expect(400)

            expect(res.body).toHaveProperty('error')
            expect(res.body.error).toHaveProperty('email')
            expect(res.body.error).toHaveProperty('pregunta')
            expect(res.body.error).toHaveProperty('respuesta')
            expect(res.body.error.email).toBe('El email no tiene un formato válido')
            expect(res.body.error.pregunta).toBe('Debe seleccionar una pregunta')
            expect(res.body.error.respuesta).toBe('Debe escribir una respuesta')
        })
    })

    describe('Validaciones de control de datos', () => {
        test('Cuenta suspendida', async () => {
            const res = await api
                .post('/api/user/recuperar-password')
                .send(
                    {
                        email: users[2].email,
                        pregunta: 'Videojuego Favorito?',
                        respuesta: 'Resident Evil'
                    }
                )
                .expect(403)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body.mensaje).toBe('Cuenta eliminada')
        })

        test('Pregunta o respuesta incorrecta', async () => {
            // creo un usuario nuevo

            let user = {
                userName: 'jillvalentine',
                email: 'jill@gmail.com',
                pregunta: 'videojuego favorito?',
                respuesta: 'Resident Evil',
                password: '123456',
                password2: '123456',
                imagen: ''
            }

            await api
                .post('/api/user/registro')
                .send(user)
                .expect(201)

            // Intento recuperar password

            let recuperar = {
                email: 'fakeuser6@gmail.com',
                pregunta: 'Serie favorita?',
                respuesta: 'Breaking bad'
            }

            const res2 = await api
                .post('/api/user/recuperar-password')
                .send(recuperar)
                .expect(400)

            expect(res2.body).toHaveProperty('mensaje')
            expect(res2.body.mensaje).toBe('Pregunta o respuesta incorrecta')
        })

        test('Recuperacion de password correcta', async () => {
            // creo un usuario nuevo

            let user = {
                userName: 'jillvalentine',
                email: 'jill@gmail.com',
                pregunta: 'VIDEOJUEGO FAVORITO?',
                respuesta: 'Resident Evil',
                password: '123456',
                password2: '123456',
                imagen: ''
            }

            await api
                .post('/api/user/registro')
                .send(user)
                .expect(201)

            // Intento recuperar password

            let recuperar = {
                email: 'jill@gmail.com',
                pregunta: 'videojuego favorito?',
                respuesta: 'Resident Evil',
            }

            const res = await api
                .post('/api/user/recuperar-password')
                .send(recuperar)
                .expect(200)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body).toHaveProperty('tempPassword')
            expect(res.body.mensaje).toBe('Contraseña temporal generada correctamente')

            // Intento loguearme con el nuevo password

            await api.post('/api/login').send({ user: 'jillvalentine', password: res.body.tempPassword }).expect(200)
        })
    })
})



afterAll(async () => {
    await mongoose.connection.close()
}) 