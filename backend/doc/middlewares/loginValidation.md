# Middleware: `loginValidation`

Este middleware valida las credenciales de inicio de sesión enviadas por el usuario.  
Realiza sanitización de los datos, verifica la presencia y formato de los campos, comprueba la existencia del usuario en la base de datos y compara la contraseña encriptada usando `bcrypt`.  
Si las validaciones son exitosas, adjunta la información del usuario a `req.user` y continúa con el flujo del request mediante `next()`.

---

## Importación de validaciones, dependencias y modelo

```js
const { passwordValidations } = require('../utils/user/validations')
const bcrypt = require('bcrypt')
const User = require('../models/user')
```

- **passwordValidations:** función auxiliar que valida formato y reglas del password.
- **bcrypt:** dependencia para comparar contraseñas encriptadas.
- **User:** modelo de usuario de Mongoose.

---

## Flujo del middleware

```js
const loginValidation = async (req, res, next) => { ... }
```

### 1. Extracción de datos del body y creación del objeto `error`
```js
let { user, password } = req.body
const error = {}
```
- Se obtienen los campos enviados por el usuario desde `req.body`.
- Se crea el objeto `error` donde se guardarán las propiedades con los campos que fallaron y sus mensajes.

---

### 2. Sanitización
```js
user = user?.trim().toLowerCase()
password = password?.trim()
```
- Se eliminan espacios al inicio y al final con `.trim()`.
- En el caso de `user`, se convierte a minúsculas para evitar problemas de coincidencia entre mayúsculas/minúsculas.

---

### 3. Validaciones de presencia y formato
```js
if (!user || user.length === 0) error.user = 'Ingrese un usuario o email'

const passwordError = passwordValidations(password)
if (passwordError) error.password = passwordError

if (Object.keys(error).length > 0) 
    return res.status(400).json({ error })
```
- Se valida que el usuario haya ingresado un valor en el campo `user`.
- Luego se ejecuta la función auxiliar `passwordValidations(password)` que valida campos vacíos, longitud mínima (6 caracteres) y espacios en blanco.
- Si existen errores, se responde con **400 Bad Request** y los detalles por campo.

---

### 4. Validaciones de existencia y comparación de contraseña
```js
const currentUser = await User.findOne({
    $or: [
        { userName: user },
        { email: user }
    ]
})
```
- Se busca un usuario cuyo `userName` o `email` coincidan con el valor ingresado.

```js
if (!currentUser || currentUser.suspendida) 
    return res.status(404).json({ error: { invalid: 'Cuenta inexistente o suspendida' } })
```
- Si no se encuentra el usuario o está suspendido, se devuelve **404 Not Found** con un mensaje descriptivo.

```js
const isMatch = await bcrypt.compare(password, currentUser.password)
if (!isMatch) 
    return res.status(400).json({ error: { password: 'Password incorrecto' } })
```
- `bcrypt.compare()` no desencripta la contraseña guardada, sino que aplica el mismo proceso de hash al password ingresado y compara ambos resultados.
- Si la comparación falla, se devuelve **400 Bad Request**.

---

### 5. Asignación de datos a `req.user` y continuación del flujo
```js
req.user = {
    id: currentUser._id,
    email: currentUser.email,
    userName: currentUser.userName,
    rol: currentUser.rol,
    imagen: currentUser.imagen
}

next()
```
- Si las validaciones son exitosas, se guarda la información del usuario en `req.user` para reutilizarla en controladores posteriores.
- Finalmente se llama a `next()` para continuar con el flujo normal.

---

## Posibles respuestas

| Código | Motivo | Ejemplo de respuesta |
|---------|---------|--------------------|
| **400** | Campos inválidos o contraseña incorrecta | `{ error: { password: 'Password incorrecto' } }` |
| **404** | Usuario inexistente o suspendido | `{ error: { invalid: 'Cuenta inexistente o suspendida' } }` |

---

## Exportación

```js
module.exports = loginValidation
```
Este middleware se utiliza en la ruta:

```js
router.post('/login', limiter, loginValidation, loginController.login)
```

---

