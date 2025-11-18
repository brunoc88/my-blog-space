# Rutas de user (/api/user)

Este archivo se definen las rutas de `user` encargadas de:

- Registro de usuarios `comun` o `admin`
- Recuperar password
- Eliminar/suspender cuenta
- Editar datos de cuenta
- Cambiar cuenta a publica o privada
- Bloquear usuario
- Desbloquear usuario
- Seguir usuario
- Dejar de seguir usuario
- Aceptar solicitud de seguimiento
- Rechazar solicitud de seguimiento
- Lista de bloqueados
- Lista de solicitudes
- Lista de seguidos
- Lista de seguidores
- Mi perfil
- Perfil de un usuario

---

## Importaciones 

```js
const router = require('express').Router()
const userValidations = require('../middlewares/user/userValidations')
const { userExtractor } = require('../middlewares/authMiddleware')
const limiter = require('../middlewares/limiter')
const suspensionGuard = require('../middlewares/user/suspensionGuard')
const recoveryPasswordValidations = require('../middlewares/user/recoveryPasswordValidations')
const recoveryPasswordGuard = require('../middlewares/user/recoveryPasswordGuard')
const verifyBlock = require('../middlewares/verifyBlock')
const verifyBlockPermissions = require('../middlewares/user/verifyBlockPermissions')
const verifyFollowing = require('../middlewares/user/verifyFollowing')
const verifyAction = require('../middlewares/user/verifyAction')
const upload = require('../utils/multer')
const userController = require('../controllers/user')
```

- **express.Router()**: crea una instancia de router independiente para definir las rutas. 
- **userValidations**: Middleware para validar los datos del registro o edicion de un usuario.
- **userExtractor**: middleware para comprobar si el usuario esta logueado y autenticado.
- **limiter**: middleware que limita la cantidad de solicitudes que puede hacer un usuario en un periodo determinado (protección contra ataques de fuerza bruta).  
- **suspensionGuard**: Middleware encargado de validar la suspesion y/o eliminacion de cuenta de usuario.
- **recoveryPasswordValidations**: Este middleware se encarga de validar los datos ingresados por el usuario en el formulario para la recuperación su password.
- **revoceryPasswordGuard**: Middleware encargado de validar la recuperacion de password de un usuario.
- **verifyBlock**: Este middleware se encarga de validar si hay bloqueo entre usuarios.
- **verifyBlockPermissions**: Middleware encargado del bloqueo entre usuarios segun su rol.
- **verifyFollowing**: Se encarga de controlar el seguimiento entre usuarios.
- **verifyAction**: Se encarga de verificar las acciones entre usuarios: bloqueos, seguimiento y solicitudes de seguimiento.
- **upload**: Para manejo de imagen.
- **userController**: controlador de las acciones de las rutas de `user`.

---

## Definición de las rutas

### Rutas publicas

#### Registrar usuario

```js
router.post('/registro', limiter, upload.single('imagen'), userValidations, userController.crearUser)
```
##### Flujo del request

1. **`limiter`**
    - Controla que no hay intentos de forzar entrar al sistama.
2. **`upload.single('imagen')`**
    - Se encarga de los archivos de imagan y poder obtener de `req.file`.
3. **`userValidations`**
    - Valida que los datos para registrarse sean correctos.
4. **`userController.crearUser`
    - Recibe los datos ya validados y sanitizados.
    - Procede a guardar los datos del usuario en la base de datos.

---

#### Registrar usuario admin

```js
router.post('/registro/:admin', limiter, upload.single('imagen'), userValidations, userController.crearUser)
```
##### Flujo del request

Mismo procedimiento, lo unico que cambia es que al pasar parametro `admin` el controlador `userController.crearUsuario` le va a asignar el rol de administrador.

---

#### Recuperar password

```js
router.post('/recuperar-password', limiter, recoveryPasswordValidations, recoveryPasswordGuard, userController.recuperarPassword)
```
##### Flujo del request

1. **`limiter`**
    - Controla que no hay intentos de forzar entrar al sistama.
2. **`recoveryPasswordValidations`**
    - Valida que los datos ingresados sean correctos.
3. **`recoveryPasswordGuard`**
    - Controla que la cuenta este activa o exista
    - Comprueba que la `pregunta` y `respuesta` ingresados concuender con los registrados en la base de datos.
4. **`userController.recuperarPassword`**
    - Genera un password generico para que el usuario pueda loguearse de forma temporal.

---

### Rutas privadas

```js
router.use(userExtractor)
```

- Aplicacion de `userExtractor` para controlar si el usuario esta registrado y logueado.

#### Eliminar o suspender cuenta

```js
router.patch('/:id/suspender', suspensionGuard, userController.suspenderCuenta)
```

##### Flujo del request

1. **`suspensionGuard`**
    - Controla si el usuario que va a eliminar la cuenta tiene permiso para realizar la accion.
2. **`userController.suspenderCuenta`**
    - Procede a desactivar la cuenta.

---

#### Editar datos de la cuenta

```js
router.put('/editar', upload.single('imagen'), userValidations, userController.editarCuenta)
```

##### Flujo del request

1. **`upload.single('imagen')`**
    - Para el uso de imagenes.
2. **`userValidations`**
    - Valida que los datos ingresados sean correctos.
3. **`userController.editarCuenta`**
    - Actualiza los datos de la cuenta

---

#### Estado de la cuenta

```js
router.patch('/estado', userController.estado)
```

##### Flujo del request

1. **`userController.estado`**
    - Se encarga de cambiar la cuenta a `privada` o `publica`.

---

#### Bloquear usuario

```js
router.patch('/bloquear/:id', verifyBlock, verifyBlockPermissions, userController.bloquear)
```
##### Flujo del request

1. **`verifyBlock`**
    - Comprueba que no exista bloqueo entre ambas partes.
2. **`verifyBlockPermissions`**
    - Comprueba que el usuario a bloquear no sea `admin`.
3. **`userController.bloquear`**
    - Realiza el bloqueo

---

#### Desbloquear usuario

```js
router.patch('/desbloquear/:id', verifyAction('bloqueo'), userController.desbloquear)
```
##### Flujo del request

1. **`verifyAction('bloqueo')`**
    - Verifica que el usuario a desbloquear siga activo o existente.
    - Revisa si el usuario sigue en lista de bloqueados.
2. **`userController.desbloquear`**
    - Desbloquea al usuario

---

#### Seguir usuario

```js
router.patch('/seguir/:id', verifyBlock, verifyFollowing, userController.seguir)
```

##### Flujo del request

1. **`verifyBlock`**
    - Verifica que no exista bloqueo entre ambas partes.
2. **`verifyFollowing`**
    - Verifica que el usuario no se siga a si mismo.
    - Verifica que el usuario no este siguiendo al otro usuario desde antes.
3. **`userController.seguir`**
    - Se encarga de realizar el seguimiento o mandar solicitud si es que la cuenta a seguir es privada.

---

#### Dejar de seguir usuario

```js
router.patch('/noSeguir/:id', verifyAction('seguimiento'), userController.dejarDeSeguir)
```

##### Flujo del request

1. **`verifyAction('seguimiento')`**
    - Comprueba si el usuario sigue en nuestra lista de seguidos.
2. **`userController.dejarDeSeguir`**
    - Se encarga de dejar de seguir al usuario

---

#### Aceptar solicitud de seguimiento

```js
router.patch('/solicitud/aceptar/:id', verifyBlock, verifyAction('solicitud'), userController.aceptarSolicitud)
```

##### Flujo del request

1. **`verifyBlock`**
    - Comprueba que no exista bloqueo entre ambas partes.
2. **`verifyAction('solicitud')`**
    - Verifica que el usuario siga en mi lista de solicitudes.
3. **`userController.aceptarSolicitud`**
    - Se encarga de aceptar la solicitud.

---

#### Rechazar solicitud de seguimiento

```js
router.patch('/solicitud/rechazar/:id', verifyAction('solicitud'), userController.rechazarSolicitud)
```

##### Flujo del request

1. **`verifyAction('solicitud')`**
    - Verifica si la solicitud sigue estando activa.
2. **`userController.rechazarSolicitud`**
    - Se encarga de rechazar la solicitud.

---

#### Lista de bloqueados

```js
router.get('/bloqueados', userController.listaDeBloqueados)
```

##### Flujo del request

1. **`userController.listaDeBloqueados`**
    - Nos provee la lista de usuarios bloqueados.

---

#### Lista de Solicitudes

```js
router.get('/solicitudes', userController.listaDeSolicitudes)
```

##### Flujo del request

1. **`userController.listaDeSolicitudes`**
    - Nos provee la lista de solicitudes de seguimiento.

---

#### Lista de Seguidos

```js
router.get('/seguidos', userController.listaDeSeguidos)
```

##### Flujo del request

1. **`userController.listaDeSeguidos`**
    - Nos provee la lista de los usuarios que seguimos.

---

#### Lista de Seguidores

```js
router.get('/seguidores', userController.listaDeSeguidores)
```

##### Flujo del request

1. **`userController.listaDeSeguidores`**
    - Nos provee la lista de los usuarios que nos siguen.

---

#### Mi perfil

```js
router.get('/miPerfil', userController.perfil)
```

##### Flujo del request

1. **`userController.perfil`**
    - Nos provee toda la informacion de nuestro perfil.

---

#### Perfil de usuario

```js
router.get('/:id/perfil', verifyBlock, userController.perfil)
```

##### Flujo del request

1. **`verifyBlock`**
    - Controla que no exista bloqueo entre ambas partes.
2. **`userController.perfil`**
    - Provee informacion del perfil del usuario.

---

## Exportación

```js
module.exports = router
```

- Exporta la instancia del router para ser utilizada dentro del archivo principal de rutas o en `app.js`.

---

## Ejemplo de integración

```js
const userRouter = require('./routes/user')
app.use('/api/user', userRouter)
```
