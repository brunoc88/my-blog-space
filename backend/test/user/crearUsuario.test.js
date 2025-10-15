const app = require('../../app')
const mongoose = require('mongoose')
const supertest = require('supertest')
const User = require('../../models/user')
const api = supertest(app)
const { MONGODB_URI } = require('../../utils/config')

// como levantabamos la DB en index hacemos uso de beforeAll
beforeAll(async () => {
  await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
  await User.deleteMany({})
})

describe('/api/user/registro', () => {
  describe('Validaciones de userName', () => {
    test('Validaciones de userName', async () => {
      const user = {
        userName: 'brun',
        email: 'bruno@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident evil',
        password: '123456',
        password2: '123456'
      }

      const res = await api
        .post('/api/user/registro')
        .send(user)
        .expect(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).not.toBeNull()
      expect(res.body.error).toHaveProperty('userName')
      expect(res.body.error.userName).toBe('Mínimo 5 caracteres')

    })
  })

})

afterAll(async () => {
  await mongoose.connection.close()
})  