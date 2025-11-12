# Controlador: `loginController.login`

Este controlador maneja la respuesta final del proceso de inicio de sesión.  
Se encarga de generar un **token JWT** con los datos del usuario previamente validados y de devolverlo junto con la información básica del usuario.

---

## Importaciones

```js
const jwt = require('jsonwebtoken')
```

- **jsonwebtoken**: librería utilizada para firmar y generar tokens JWT (JSON Web Tokens).  
  Estos tokens permiten autenticar al usuario en futuras solicitudes sin necesidad de volver a enviar sus credenciales.

---

## Definición del método

```js
exports.login = (req, res, next) => {
    try {
        const { id, userName, email, rol, imagen } = req.user

        let userForToken = {
            id,
            userName,
            email,
            rol,
            imagen
        }

        let token = jwt.sign(
            userForToken,
            process.env.SECRET,
            { expiresIn: '1h' }
        )

        return res.status(200).json({
            msj: 'Login exitoso!',
            user: userForToken,
            token
        })

    } catch (error) {
        next(error)
    }
}
```

---

## Flujo del controlador

### 1. Extracción de datos del usuario

```js
const { id, userName, email, rol, imagen } = req.user
```

- Los datos provienen del objeto `req.user`, generado previamente por el middleware `loginValidation`.  
- Contienen la información necesaria para identificar al usuario dentro del sistema.

---

### 2. Creación del payload del token

```js
let userForToken = { id, userName, email, rol, imagen }
```

- Se define un objeto que servirá como **payload** (contenido) del token.  
- Este payload incluye solo la información relevante para identificar al usuario y su rol.

---

### 3. Generación del token JWT

```js
let token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: '1h' }
)
```

- Se genera un token firmado con la clave secreta (`process.env.SECRET`) almacenada en variables de entorno.  
- El token tiene una validez de **1 hora** (`expiresIn: '1h'`).  
- El contenido (`payload`) no debe incluir información sensible como contraseñas o datos personales innecesarios.

---

### 4. Respuesta exitosa

```js
return res.status(200).json({
    msj: 'Login exitoso!',
    user: userForToken,
    token
})
```

- Devuelve un **200 OK** junto con:
  - Un mensaje de confirmación.
  - Los datos básicos del usuario.
  - El token JWT para autenticación en futuras solicitudes.

---

### 5. Manejo de errores

```js
} catch (error) {
    next(error)
}
```

- Cualquier error durante el proceso es pasado al **middleware de manejo de errores** mediante `next(error)`.

---

## Ejemplo de respuesta exitosa

```json
{
  "msj": "Login exitoso!",
  "user": {
    "id": "674d9e52c2a812fcbef3ad7a",
    "userName": "bruno_dev",
    "email": "bruno@mail.com",
    "rol": "admin",
    "imagen": "profile123.jpg"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

---

## Buenas prácticas

- Mantener la clave `SECRET` en las variables de entorno y **nunca** exponerla en el código fuente.
- Evitar incluir datos sensibles en el payload del token.
- Asegurar que la expiración del token sea razonable y renovable mediante un endpoint de refresh si se requiere.

---

## Exportación

```js
exports.login = login
```

Este controlador se utiliza en conjunto con el middleware `loginValidation` en la siguiente ruta:

```js
router.post('/login', limiter, loginValidation, loginController.login)
```

---


