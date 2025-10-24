const app = require('../../app')
const mongoose = require('mongoose')
const supertest = require('supertest')
const Tag = require('../../models/tag')
const User = require('../../models/user')
const api = supertest(app)
const { MONGODB_URI } = require('../../utils/config')
const { loadUsers, getUsers } = require('../test_helper')
const { loadTags, getTags } = require('../dummy_tags')
const path = require('path') // Necesario para ruta a la imagen
const fs = require('fs')
const uploadDir = path.join(__dirname, '../../public/uploads')

let users = null
let token = null
let token2 = null
let tags = null

beforeAll(async () => {
    await mongoose.connect(MONGODB_URI)
})

beforeEach(async () => {
    await Tag.deleteMany({})
    await User.deleteMany({})
    await loadUsers()
    users = await getUsers()
    await loadTags()
    tags = await getTags()
    const res = await api.post('/api/login').send({ user: users[0].userName, password: 'sekret' })
    const res2 = await api.post('/api/login').send({ user: users[1].userName, password: 'sekret' })

    token = res.body.token
    token2 = res2.body.token
})

describe('POST /api/blog/crear', () => {
    describe('Postear blog ', () => {
        test('Blog sin imagen', async () => {
            let blog = {
                titulo: 'Nuevo Resident Evil',
                nota: 'CapCom acaba de hacer publico los avances del nuevo Resident Evil Requiem',
                autor: users[0].id,
                visibilidad: 'publico',
                tags: [tags[0].id, tags[1].id],
                permitirComentarios: 'permitir'
            }

            const res = await api
                .post('/api/blog/crear')
                .set('Authorization', `Bearer ${token}`)
                .send(blog)
                .expect(201)

            expect(res.body).toHaveProperty('mensaje')
            expect(res.body).toHaveProperty('blog')
            expect(res.body.mensaje).toContain('Blog creado')
            expect(res.body.blog.titulo).toBe(blog.titulo)
            expect(res.body.blog.nota).toBe(blog.nota)
            expect(res.body.blog.visibilidad).toBe(true)
            expect(res.body.blog.tags).toEqual(
                expect.arrayContaining(blog.tags)
            )
            expect(res.body.blog).toHaveProperty('estado')
            expect(res.body.blog.estado).toBe(true)
        })

        test('Blog privado con imagen & sin comentarios permitidos', async () => {
            await api
                .post('/api/blog/crear')
                .set('Authorization', `Bearer ${token}`)
                .field('titulo', 'Nuevo Resident Evil')
                .field('nota', 'CapCom acaba de hacer publico los avances del nuevo Resident Evil Requiem')
                .field('autor', users[0].id)
                .field('visibilidad', 'privado')
                .field('permitirComentarios', 'no permitir')
                .field('tags', [tags[0].id, tags[1].id])
                .attach('imagen', path.join(__dirname, 'fixtures', 'test-imagen.png'))
                .expect(201)
        })

    })

    describe('Validaciones', () => {
        describe('Tipo de datos', () => {
            test('Incorrectos', async () => {
                let blog = {
                    titulo: 123456,
                    nota: true,
                    visibilidad: true,
                    permitirComentarios: false
                }
                const res = await api
                    .post('/api/blog/crear')
                    .set('Authorization', `Bearer ${token}`)
                    .send(blog)
                    .expect(400)

                expect(res.body).not.toBeNull()
                expect(res.body).toHaveProperty('error')
                expect(res.body.error).toHaveProperty('titulo')
                expect(res.body.error).toHaveProperty('nota')
                expect(res.body.error).toHaveProperty('visibilidad')
                expect(res.body.error).toHaveProperty('permitirComentarios')
                expect(res.body.error.titulo).toBe("El campo 'titulo' debe ser de tipo string")
                expect(res.body.error.nota).toBe("El campo 'nota' debe ser de tipo string")
                expect(res.body.error.visibilidad).toBe("El campo 'visibilidad' debe ser de tipo string")
                expect(res.body.error.permitirComentarios).toBe("El campo 'permitirComentarios' debe ser de tipo string")
            })
        })
        describe('Titulo', () => {
            test('Titulo vacio', async () => {
                let blog = {
                    titulo: '',
                    nota: 'Lo que nos esta preparando CapCom',
                    visibilidad: 'publico',
                    permitirComentarios: 'permitir',
                    author: users[0].id,
                    tags: [tags[0].id]
                }
                const res = await api
                    .post('/api/blog/crear')
                    .set('Authorization', `Bearer ${token}`)
                    .send(blog)
                    .expect(400)

                expect(res.body).not.toBeNull()
                expect(res.body).toHaveProperty('error')
                expect(res.body.error).toHaveProperty('titulo')
                expect(res.body.error.titulo).toBe('El título es obligatorio')
            })

            test('Titulo menor a 5 caracteres', async () => {
                let blog = {
                    titulo: 're9',
                    nota: 'Lo que nos esta preparando CapCom',
                    visibilidad: 'publico',
                    permitirComentarios: 'permitir',
                    author: users[0].id,
                    tags: [tags[0].id]
                }
                const res = await api
                    .post('/api/blog/crear')
                    .set('Authorization', `Bearer ${token}`)
                    .send(blog)
                    .expect(400)

                expect(res.body).not.toBeNull()
                expect(res.body).toHaveProperty('error')
                expect(res.body.error).toHaveProperty('titulo')
                expect(res.body.error.titulo).toBe('El título debe tener al menos 5 caracteres')
            })

            test('Titulo invalido', async () => {
                let blog = {
                    titulo: '@resident evil!',
                    nota: 'Lo que nos esta preparando CapCom',
                    visibilidad: 'publico',
                    permitirComentarios: 'permitir',
                    author: users[0].id,
                    tags: [tags[0].id]
                }
                const res = await api
                    .post('/api/blog/crear')
                    .set('Authorization', `Bearer ${token}`)
                    .send(blog)
                    .expect(400)

                expect(res.body).not.toBeNull()
                expect(res.body).toHaveProperty('error')
                expect(res.body.error).toHaveProperty('titulo')
                expect(res.body.error.titulo).toBe('El título solo puede contener letras, números y signos básicos')
            })
        })
        describe('Notas', () => {
            test('Nota vacia', async () => {
                let blog = {
                    titulo: 'Resident Evil 9',
                    nota: '',
                    visibilidad: 'publico',
                    permitirComentarios: 'permitir',
                    author: users[0].id,
                    tags: [tags[0].id]
                }
                const res = await api
                    .post('/api/blog/crear')
                    .set('Authorization', `Bearer ${token}`)
                    .send(blog)
                    .expect(400)

                expect(res.body).not.toBeNull()
                expect(res.body).toHaveProperty('error')
                expect(res.body.error).toHaveProperty('nota')
                expect(res.body.error.nota).toBe('La nota es obligatoria')
            })

            test('Nota menor a 20 caracteres', async () => {
                let blog = {
                    titulo: 'Resident Evil 9',
                    nota: 'sin nota',
                    visibilidad: 'publico',
                    permitirComentarios: 'permitir',
                    author: users[0].id,
                    tags: [tags[0].id]
                }
                const res = await api
                    .post('/api/blog/crear')
                    .set('Authorization', `Bearer ${token}`)
                    .send(blog)
                    .expect(400)

                expect(res.body).not.toBeNull()
                expect(res.body).toHaveProperty('error')
                expect(res.body.error).toHaveProperty('nota')
                expect(res.body.error.nota).toBe('La nota debe tener al menos 20 caracteres')
            })
        })
        describe('Tags', () => {
            test('Blog sin etiquetas', async () => {
                let blog = {
                    titulo: 'Resident Evil 9',
                    nota: 'CapCom acaba de hacer publico los avances del nuevo Resident Evil Requiem',
                    visibilidad: 'publico',
                    permitirComentarios: 'permitir',
                    author: users[0].id,
                    tags: []
                }
                const res = await api
                    .post('/api/blog/crear')
                    .set('Authorization', `Bearer ${token}`)
                    .send(blog)
                    .expect(400)

                expect(res.body).not.toBeNull()
                expect(res.body).toHaveProperty('error')
                expect(res.body.error).toHaveProperty('tags')
                expect(res.body.error.tags).toBe('Debe incluir al menos una etiqueta')
            })
            test('Tag sin ser array', async () => {
                let blog = {
                    titulo: 'Resident Evil 9',
                    nota: 'CapCom acaba de hacer publico los avances del nuevo Resident Evil Requiem',
                    visibilidad: 'publico',
                    permitirComentarios: 'permitir',
                    author: users[0].id,
                    tags: ''
                }
                const res = await api
                    .post('/api/blog/crear')
                    .set('Authorization', `Bearer ${token}`)
                    .send(blog)
                    .expect(400)

                expect(res.body).not.toBeNull()
                expect(res.body).toHaveProperty('error')
                expect(res.body.error).toHaveProperty('tags')
                expect(res.body.error.tags).toBe('El campo "tags" debe ser un array')
            })
        })
        describe('Visibilidad', () => {
            test('Visibilidad no elegida', async () => {
                let blog = {
                    titulo: 'Resident Evil 9',
                    nota: 'CapCom acaba de hacer publico los avances del nuevo Resident Evil Requiem',
                    visibilidad: '',
                    permitirComentarios: 'permitir',
                    author: users[0].id,
                    tags: [tags[0].id]
                }
                const res = await api
                    .post('/api/blog/crear')
                    .set('Authorization', `Bearer ${token}`)
                    .send(blog)
                    .expect(400)

                expect(res.body).not.toBeNull()
                expect(res.body).toHaveProperty('error')
                expect(res.body.error).toHaveProperty('visibilidad')
                expect(res.body.error.visibilidad).toBe('Debe seleccionar la visibilidad')
            })
            test('Visibilidad diferente a publico & privado', async () => {
                let blog = {
                    titulo: 'Resident Evil 9',
                    nota: 'CapCom acaba de hacer publico los avances del nuevo Resident Evil Requiem',
                    visibilidad: 'no se que elegir',
                    permitirComentarios: 'permitir',
                    author: users[0].id,
                    tags: [tags[0].id]
                }
                const res = await api
                    .post('/api/blog/crear')
                    .set('Authorization', `Bearer ${token}`)
                    .send(blog)
                    .expect(400)

                expect(res.body).not.toBeNull()
                expect(res.body).toHaveProperty('error')
                expect(res.body.error).toHaveProperty('visibilidad')
                expect(res.body.error.visibilidad).toBe('Debe elegir entre publico o privado')
            })
        })
        describe('Permitir Comentarios', () => {
            test('Permiso no elegido', async () => {
                let blog = {
                    titulo: 'Resident Evil 9',
                    nota: 'CapCom acaba de hacer publico los avances del nuevo Resident Evil Requiem',
                    visibilidad: 'publico',
                    permitirComentarios: '',
                    author: users[0].id,
                    tags: [tags[0].id]
                }
                const res = await api
                    .post('/api/blog/crear')
                    .set('Authorization', `Bearer ${token}`)
                    .send(blog)
                    .expect(400)

                expect(res.body).not.toBeNull()
                expect(res.body).toHaveProperty('error')
                expect(res.body.error).toHaveProperty('permitirComentarios')
                expect(res.body.error.permitirComentarios).toBe('Debe elegir si los comentarios van estar publicos o no')
            })
            test('Permiso diferente a permitir & no permitir', async () => {
                let blog = {
                    titulo: 'Resident Evil 9',
                    nota: 'CapCom acaba de hacer publico los avances del nuevo Resident Evil Requiem',
                    visibilidad: 'no se que elegir',
                    permitirComentarios: 'no se que elegir',
                    author: users[0].id,
                    tags: [tags[0].id]
                }
                const res = await api
                    .post('/api/blog/crear')
                    .set('Authorization', `Bearer ${token}`)
                    .send(blog)
                    .expect(400)

                expect(res.body).not.toBeNull()
                expect(res.body).toHaveProperty('error')
                expect(res.body.error).toHaveProperty('visibilidad')
                expect(res.body.error.visibilidad).toBe('Debe elegir entre publico o privado')
            })
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