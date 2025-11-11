# Ruta: `/tag`

Este archivo se definen las rutas encargadas de la creacion, edicion, activacion, desactivacion y el listado de etiquetas de la api.
Utiliza **middleware de autenticacion** `userExtractor`, **middleware de validacion** `tagValidations`, **middleware de role** `verifyRole(rol)` y un controlador `tagController` para manejar la logica crud de las etiquetas.

---

## Importaciones 

```js
const router = require('express').Router()
const tagValidations = require('../middlewares/tag/tagValidations')
const { verifyRole, userExtractor } = require('../middlewares/authMiddleware')
const tagController = require('../controllers/tag')

```

- **express.Router()**: crea una instancia de router independiente para definir las rutas de autenticación. 
- **tagValidations**: middleware que valida el campo `nombre` para la creacion o edicion de etiquetas.
-**verifyRole**: middleware para comprobar si el usuario registrado tiene permiso para acceder a las rutas de etiqueta.
-**userExtractor**: middleware para comprobar si el usuario esta logueado y autenticado.
-**tagController**: controlador que maneja las acciones crud de etiquetas `tags`.

---

## Aplicacion de middlewares de autenticacion y role

```js
router.use(userExtractor)
router.use(verifyRole('admin'))
```
- Cada solicitud(`request`) que se le haga a las rutas de etiqueta el usuario debera estar autenticado y debe tener el **rol** `admin`. Sino cumple con las condiciones automaticamente el seridor lanzara un **401 Unauthorized** a falta de `token` por no estar logueado y en caso de que si lo este y no sea un usuario con rol `admin` lanzara **403 Forbidden**.

## Definición de las rutas

### Crear etiqueta
```js
router.post('/crear', tagValidations, tagController.crearEtiqueta)
```

#### Flujo del request

1. **`tagValidation`**
    - Controla que el campo `nombre` para la etiqueta sea valido.
2. **`tagController.crearEtiqueta`**
    - Recibe el `req.body.nombre` ya validado y sanitizado.
    - Crea la etiqueta

---

### Editar etiqueta

```js
router.patch('/editar/:id', tagValidations, tagController.editar)
```
#### Flujo del request

1. **`tagValidation`**
    - Controla que el campo `nombre` para la etiqueta sea valido.
2. **`tagController.editar`**
    - Recibe el `req.body.nombre` ya validado y sanitizado.
    - busca que la etiqueta exista
    - busca que la etiqueta este activa
    - actualiza la etiqueta

---

### Desactivar etiqueta

```js
router.patch('/desactivar/:id', tagController.desactivar)
```
#### Flujo del request

- **`tagController.desactivar`**
    - Recibe el `id` del `req.params`.
    - Busca que la etiqueta exista.
    - Comprueba que no este activa.
    - Actualiza cambiando el estado a `false`.

---

### Activar etiqueta

```js
router.patch('/activar/:id', tagController.activar)

```
#### Flujo del request

- **`tagController.activar`**
    - Recibe el `id` del `req.params`.
    - Busca que la etiqueta exita.
    - Buscar que si exite este activa.
    - Actualiza cambiando el estado a `true`.
---

### Obtener listado de etiquetas 

```js
router.get('/lista', tagController.lista)
```
#### Flujo del request

- **`tagController.lista`**
    - Consulta a la db para obtener un array con todas las etiquetas.
    - Devuelve un `json` con las etiquetas.

---

## Exportación

```js
module.exports = router
```

- Exporta la instancia del router para ser utilizada dentro del archivo principal de rutas o en `app.js`.

---

## Ejemplo de integración

```js
const tagRouter = require('./routes/tag')
app.use('/api/tag', tagRouter)
```

