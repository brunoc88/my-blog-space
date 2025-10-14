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
  test('creando usuario sin imagen', async () => {
    const user = {
      userName: 'bruno88',
      email: 'bruno88@gmail.com',
      pregunta: 'nombre de mascota',
      respuesta: 'cecilio',
      password: '123456'
    }

    const res = await api
      .post('/api/user/registro')
      .send(user)
      .expect(201)

    
    expect(res.body).toHaveProperty('msj')
    expect(res.body).toHaveProperty('user')
    expect(res.body.msj).toContain('Usuario guardado!')
  })

})

afterAll(async () => {
  await mongoose.connection.close()
})  