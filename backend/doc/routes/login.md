# Ruta: `/login`

Este archivo define la ruta encargada del inicio de sesión de los usuarios.  
Utiliza un **rate limiter**, un **middleware de validación** y un **controlador** para manejar la lógica del login de forma segura y modular.

---

## Importaciones

```js
const router = require('express').Router()
const loginValidation = require('../middlewares/loginValidation')
const limiter = require('../middlewares/limiter')
const loginController = require('../controllers/login')
```

- **express.Router()**: crea una instancia de router independiente para definir las rutas de autenticación.  
- **loginValidation**: middleware que valida las credenciales enviadas por el usuario.  
- **limiter**: middleware que limita la cantidad de solicitudes que puede hacer un usuario en un periodo determinado (protección contra ataques de fuerza bruta).  
- **loginController**: controlador que maneja la lógica de inicio de sesión una vez que las validaciones fueron exitosas.

---

## Definición de la ruta

```js
router.post('/login', limiter, loginValidation, loginController.login)
```

### Flujo del request

1. **`limiter`**
   - Controla la frecuencia de solicitudes al endpoint `/login`.
   - Si un cliente excede el límite configurado, se bloquea temporalmente para evitar intentos de fuerza bruta.

2. **`loginValidation`**
   - Verifica que los campos `user` y `password` estén presentes, correctamente formateados y coincidan con un usuario registrado en la base de datos.
   - En caso de éxito, agrega la información del usuario autenticado en `req.user`.

3. **`loginController.login`**
   - Recibe el request con `req.user` ya validado.
   - Genera y devuelve el token o la cookie de sesión según la lógica de autenticación definida en el controlador.

---

## Exportación

```js
module.exports = router
```

- Exporta la instancia del router para ser utilizada dentro del archivo principal de rutas o en `app.js`.

---

## Ejemplo de integración

```js
const loginRouter = require('./routes/login')
app.use('/api', loginRouter)
```

Con esta configuración, el endpoint completo sería:

```
POST /api/login
```

---

