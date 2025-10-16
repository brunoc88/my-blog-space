const app = require('../../app')
const mongoose = require('mongoose')
const supertest = require('supertest')
const User = require('../../models/user')
const api = supertest(app)
const { MONGODB_URI } = require('../../utils/config')
const path = require('path') // Necesario para ruta a la imagen
const fs = require('fs')
const uploadDir = path.join(__dirname, '../../public/uploads')

// como levantabamos la DB en index hacemos uso de beforeAll
beforeAll(async () => {
  await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
  await User.deleteMany({})
})

describe('/api/user/registro', () => {
  describe('Validaciones de userName', () => {
    test('userName menor a 5 caracteres', async () => {
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

    test('userName mayor a 15 caracteres', async () => {
      const user = {
        userName: 'bruno12345678910',
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
      expect(res.body.error.userName).toBe('Máximo 15 caracteres')
      expect(res.body.error.userName).toContain('Máximo 15 caracteres')
    })

    test('userName vacio', async () => {
      const user = {
        userName: '',
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
      expect(res.body.error.userName).toBe('Ingrese un nombre')
    })
  })

  describe('Validaciones de email', () => {
    test('email vacio', async () => {
      const user = {
        userName: 'bruno88',
        email: '',
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
      expect(res.body.error).toHaveProperty('email')
      expect(res.body.error.email).toBe('Ingrese un email')
    })

    test('email con espacios', async () => {
      const user = {
        userName: 'bruno88',
        email: 'bruno 88@gmail.com',
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
      expect(res.body.error).toHaveProperty('email')
      expect(res.body.error.email).toBe('El email no debe contener espacios')
    })

    test('email invalido', async () => {
      const user = {
        userName: 'bruno88',
        email: 'bruno',
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
      expect(res.body.error).toHaveProperty('email')
      expect(res.body.error.email).toBe('El email no tiene un formato válido')
    })

  })

  describe('Validaciones de password', () => {
    test('password vacio', async () => {
      const user = {
        userName: 'bruno88',
        email: 'brunoc88@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident evil',
        password: '',
        password2: '123456'
      }

      const res = await api
        .post('/api/user/registro')
        .send(user)
        .expect(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).not.toBeNull()
      expect(res.body.error).toHaveProperty('password')
      expect(res.body.error.password).toBe('Ingrese un password')
    })

    test('password con espacios', async () => {
      const user = {
        userName: 'bruno88',
        email: 'brunoc88@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident evil',
        password: '123 456',
        password2: '123456'
      }

      const res = await api
        .post('/api/user/registro')
        .send(user)
        .expect(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).not.toBeNull()
      expect(res.body.error).toHaveProperty('password')
      expect(res.body.error.password).toBe('El password no debe contener espacios')
    })

    test('password menor a 6 caracteres', async () => {
      const user = {
        userName: 'bruno88',
        email: 'brunoc88@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident evil',
        password: '12345',
        password2: '123456'
      }

      const res = await api
        .post('/api/user/registro')
        .send(user)
        .expect(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).not.toBeNull()
      expect(res.body.error).toHaveProperty('password')
      expect(res.body.error.password).toBe('Mínimo 6 caracteres')
    })

    test('confimacion de password vacio', async () => {
      const user = {
        userName: 'bruno88',
        email: 'brunoc88@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident evil',
        password: '123456',
        password2: ''
      }

      const res = await api
        .post('/api/user/registro')
        .send(user)
        .expect(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).not.toBeNull()
      expect(res.body.error).toHaveProperty('password2')
      expect(res.body.error.password2).toBe('Debe ingresar la confirmación')
    })

    test('password & confirmacion de password distintos', async () => {
      const user = {
        userName: 'bruno88',
        email: 'brunoc88@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident evil',
        password: '123456',
        password2: '654321'
      }

      const res = await api
        .post('/api/user/registro')
        .send(user)
        .expect(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).not.toBeNull()
      expect(res.body.error).toHaveProperty('password2')
      expect(res.body.error.password2).toBe('No coinciden los passwords')
    })

    test('password & confirmacion de password vacios', async () => {
      const user = {
        userName: 'bruno88',
        email: 'brunoc88@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident evil',
        password: '',
        password2: ''
      }

      const res = await api
        .post('/api/user/registro')
        .send(user)
        .expect(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).not.toBeNull()
      expect(res.body.error).toHaveProperty('password')
      expect(res.body.error).toHaveProperty('password2')
      expect(res.body.error.password).toBe('Ingrese un password')
      expect(res.body.error.password2).toBe('Debe ingresar la confirmación')
    })
  })

  describe('Validaciones de pregunta', () => {
    test('pregunta vacia', async () => {
      const user = {
        userName: 'bruno88',
        email: 'brunoc88@gmail.com',
        pregunta: '',
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
      expect(res.body.error).toHaveProperty('pregunta')
      expect(res.body.error.pregunta).toBe('Debe seleccionar una pregunta')
    })
  })

  describe('Validaciones de respuesta', () => {
    test('Respuesta vacia', async () => {
      const user = {
        userName: 'bruno88',
        email: 'brunoc88@gmail.com',
        pregunta: 'videojuego favorito?',
        respuesta: '',
        password: '123456',
        password2: '123456'
      }

      const res = await api
        .post('/api/user/registro')
        .send(user)
        .expect(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).not.toBeNull()
      expect(res.body.error).toHaveProperty('respuesta')
      expect(res.body.error.respuesta).toBe('Debe escribir una respuesta')
    })

    test('Respuesta menor a 5 caracteres', async () => {
      const user = {
        userName: 'bruno88',
        email: 'brunoc88@gmail.com',
        pregunta: 'videojuego favorito?',
        respuesta: 're',
        password: '123456',
        password2: '123456'
      }

      const res = await api
        .post('/api/user/registro')
        .send(user)
        .expect(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).not.toBeNull()
      expect(res.body.error).toHaveProperty('respuesta')
      expect(res.body.error.respuesta).toBe('Mínimo 5 caracteres')
    })

    test('Respuesta mayor a 30 caracteres', async () => {
      const user = {
        userName: 'bruno88',
        email: 'brunoc88@gmail.com',
        pregunta: 'videojuego favorito?',
        respuesta: 'residentevilmetalgeargodofwarsilenthill',
        password: '123456',
        password2: '123456'
      }

      const res = await api
        .post('/api/user/registro')
        .send(user)
        .expect(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).not.toBeNull()
      expect(res.body.error).toHaveProperty('respuesta')
      expect(res.body.error.respuesta).toBe('Máximo 30 caracteres')
    })
  })

  describe('Registro correcto de usuario comun', () => {
    test('Registro sin imagen', async () => {
      let user = {
        userName: 'bruno88',
        email: 'brunoc88@gmail.com',
        pregunta: 'videojuego favorito?',
        respuesta: 'Resident Evil',
        password: '123456',
        password2: '123456',
        imagen: ''
      }

      const res = await api
        .post('/api/user/registro')
        .send(user)
        .expect(201)

      expect(res.body).not.toBeNull()
      expect(res.body).toHaveProperty('msj')
      expect(res.body).toHaveProperty('user')
      expect(res.body.msj).toBe('Usuario guardado!')
    })

    test('Registro con imagen', async () => {
      await api
        .post('/api/user/registro')
        .field('userName', 'usuarioImg')
        .field('email', 'imguser@example.com')
        .field('password', 'miPassword123')
        .field('pregunta', 'Resident Evil Favorito?')
        .field('respuesta', 'RE3 Nemesis')
        .attach('imagen', path.join(__dirname, 'fixtures', 'test-imagen.png')) // nombre del campo debe coincidir con el de multer
        .expect(201)
        .expect('Content-Type', /application\/json/)
    })
  })

  describe('Duplicados', () => {
    test('Duplicado de email', async () => {
      let user = {
        userName: 'bruno88',
        email: 'brunoc88@gmail.com',
        pregunta: 'videojuego favorito?',
        respuesta: 'Resident Evil',
        password: '123456',
        password2: '123456',
        imagen: ''
      }

      let user2 = {
        userName: 'jose99',
        email: 'brunoc88@gmail.com',
        pregunta: 'videojuego favorito?',
        respuesta: 'Resident Evil',
        password: '123456',
        password2: '123456',
        imagen: ''
      }

      await api.post('/api/user/registro').send(user)
      const res = await api
        .post('/api/user/registro')
        .send(user2)
        .expect(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toContain(`El email '${user.email}' ya está registrado`)
    })
  })
})

describe('/api/user/registro/:admin', () => {
  describe('Validaciones de clave secreta', () => {
    test('Clave secreta vacia', async () => {
      const user = {
        userName: 'bruno88',
        email: 'bruno@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident evil',
        password: '123456',
        password2: '123456',
        clave: ''
      }

      const res = await api
      .post('/api/user/registro/:admin')
      .send(user)
      .expect(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toHaveProperty('clave')
      expect(res.body.error.clave).toBe('Ingrese la clave')
    })

     test('Clave secreta incorrecta', async () => {
      const user = {
        userName: 'bruno88',
        email: 'bruno@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident evil',
        password: '123456',
        password2: '123456',
        clave: 'extremadamente_dulce'
      }

      const res = await api
      .post('/api/user/registro/:admin')
      .send(user)
      .expect(400)

      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toHaveProperty('clave')
      expect(res.body.error.clave).toBe('Clave incorrecta')
    })
  })
})

afterEach(() => {
  // Limpias la carpeta uploads para que no acumule imágenes de tests
  fs.readdirSync(uploadDir).forEach(file => {
    if (file !== 'default.png') {
      fs.unlinkSync(path.join(uploadDir, file))
    }
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})  