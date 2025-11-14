# Middleware: userValidations

Este middleware se encarga de validar los datos de un formulario de usuario (registro o actualización) antes de enviarlos al controlador. Utiliza funciones de validación individuales para cada campo.

## Importación de validaciones

```javascript
const {
    userNameValidations,
    emailValidations,
    passwordValidations,
    password2Validations,
    preguntaValidation,
    respuestaValidations,
    claveValidation
} = require('./../utils/user/validations')
```

Cada función retorna un mensaje de error (`string`) si la validación falla, o `null` si el campo es válido.

---

## Flujo del middleware

```javascript
const userValidations = (req, res, next) => {
```

1. **Extracción de datos del body**

```javascript
let { userName, email, pregunta, respuesta, password, password2 } = req.body
```

Se obtienen los campos enviados por el usuario desde `req.body`.

---

2. **Sanitización**

```javascript
userName = userName?.trim().toLowerCase()
email = email?.trim().toLowerCase()
pregunta = pregunta?.trim().toLowerCase()
respuesta = respuesta?.trim().toLowerCase().normalize("NFD").replace(/[̀-\u036f]/g, "")
password = password?.trim()
password2 = password2?.trim()
```

- Se eliminan espacios al inicio y fin con `.trim()`.
- Se convierten todos los campos a minúsculas para consistencia.
- La respuesta se normaliza para remover acentos y caracteres especiales.

---

3. **Inicialización del objeto de errores**

```javascript
const errores = {}
```

Este objeto almacenará todos los errores encontrados por campo.

---

4. **Validaciones condicionales**

Para cada campo, si viene presente en `req.body`, se llama a su función de validación correspondiente:

```javascript
if ('userName' in req.body) {
    const userNameError = userNameValidations(userName)
    if(userNameError) errores.userName = userNameError
}

if ('email' in req.body) {
    const emailError = emailValidations(email)
    if(emailError) errores.email = emailError
}

if ('password' in req.body) {
    const passwordError = passwordValidations(password)
    if(passwordError) errores.password = passwordError
}

if ('password2' in req.body) {
    const password2Error = password2Validations(password, password2)
    if(password2Error) errores.password2 = password2Error
}

if ('pregunta' in req.body) {
    const preguntaError = preguntaValidation(pregunta)
    if(preguntaError) errores.pregunta = preguntaError
}

if ('respuesta' in req.body) {
    const respuestaError = respuestaValidations(respuesta)
    if(respuestaError) errores.respuesta = respuestaError
}

// Validación de clave para rol admin
if ('clave' in req.body) {
    const { clave } = req.body
    const claveError = claveValidation(clave.trim().toLowerCase())
    if(claveError) errores.clave = claveError
}
```

- Se usan condicionales `if (campo in req.body)` para que solo se validen los campos que realmente se enviaron.
- Esto permite reutilizar el middleware tanto en **POST** (crear usuario) como en **PUT** (actualizar usuario), sin romper validaciones si algún campo no se envía.

---

5. **Devolución de errores o paso al siguiente middleware**

```javascript
if (Object.keys(errores).length > 0) {
    return res.status(400).json({ error: errores })
}

// Si todo OK
req.body = { userName, email, pregunta, respuesta, password, password2 }

next()
```

- Si `errores` tiene alguna propiedad, se responde con un **400 Bad Request** y el detalle de errores por campo.
- Si no hay errores, se pasa a la propiedad body los atributos sanitizados y se llama a `next()` para continuar con el flujo normal del request (controlador).

---

## Exportación

```javascript
module.exports = userValidations
```

Permite importar este middleware en rutas de usuario:

```javascript
router.post('/registro', upload.single('imagen'), userValidations, userController.crearUser)
router.put('/usuario/:id', userValidations, userController.actualizarUser)
```

---

### Ventajas de este enfoque

1. Reutilización: cada validación está encapsulada en funciones separadas.
2. Flexibilidad: valida solo los campos enviados, ideal para POST y PUT.
3. Claridad: errores por campo se devuelven en un objeto fácil de manejar en frontend.
4. Sanitización previa: asegura consistencia en los datos antes de guardarlos en DB.

Este middleware es un ejemplo de buenas prácticas en **Node.js + Express** para validación de formularios complejos de usuario.