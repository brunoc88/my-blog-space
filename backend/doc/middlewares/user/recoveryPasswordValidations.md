# Middleware: recoveryPasswordValidations

Este middleware se encarga de validar los datos ingresados por el usuario en el formulario para la recuperación su password.

## Importación de validaciones

```js
const { 
    emailValidations, 
    preguntaValidation, 
    respuestaValidations 
} = require('../../utils/user/validations')
```

Cada función retorna un mensaje de error (`string`) si la validación falla, o `null` si el campo es válido.

---

## Flujo del middleware

```js
const recoveryPasswordValidations = (req, res, next) =>
```
1. **Extracción de datos del body & creacion de objeto errores**

```js
    const { email, pregunta, respuesta } = req.body
```
- Se obtienen los campos enviados por el usuario desde `req.body`.

```js
const errores = {}
```

- Creamos un objeto `errores` para guardar el campo donde se produjo el error.

---


2. **Verificación de tipos de datos esperados**

```js
    const typeChecks = {
        email: 'string',
        pregunta: 'string',
        respuesta: 'string'
    }

    for (const [campo, tipoEsperado] of Object.entries(typeChecks)) {
        if (campo in req.body && typeof req.body[campo] !== tipoEsperado) {
            errores[campo] = `El campo '${campo}' debe ser de tipo ${tipoEsperado}`
        }
    }

    if (Object.keys(errores).length > 0) {
        return res.status(400).json({ error: errores })
    }

```

- Definimos un objeto `typeChecks` para controlador que el tipo de datos corresponda con el del modelo `User`.

- Mediante el metodo `entries` de `Object` nos permite verificar el `campo` y `tipoEsperado` mientras reccoremos cada podriedad en el `forOf`.

- Preguntamos si tal `campo` se encuentra dentro de `req.body` y si tipo de dato del mismo es diferente al esperado `tipoEsperado`.

- Si la condicion es cierta se creara una propiedad con el `campo` en el que se produjo el error dentro del objeto `errores`.

- Si el objeto `errores` no esta vacio el servidor responde con un **400 Bad request** devolviendo un json `error` que contendra los errores que se produjeron.

---

3. **Sanitizacion**

```js
   const sanitized = {
        email: email?.trim().toLowerCase(),
        pregunta: pregunta?.trim().toLowerCase(),
        respuesta: respuesta
            ?.trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // elimina acentos
    }
```
- Se crea el objeto `sanitized` el cual contendra los `campos` sanitizados.

- El campo `email` se elimina los espacions al inicio & final con `trim()` y se convierte a minusculas con `toLowerCase()`.

- Hacemos el mismo procedimiento con `pregunta` y `respuesta`. Esta ultima como extra se elimina cualquier acento ingresado.

---

4. **Validaciones específicas**

```js
const emailError = emailValidations(sanitized.email)
    if (emailError) errores.email = emailError

    const preguntaError = preguntaValidation(sanitized.pregunta)
    if (preguntaError) errores.pregunta = preguntaError

    const respuestaError = respuestaValidations(sanitized.respuesta)
    if (respuestaError) errores.respuesta = respuestaError

    if (Object.keys(errores).length > 0) {
        return res.status(400).json({ error: errores })
    }

```

- En esta parte se consulta si cada campo cumple con las validaciones correspondientes.

- Si hay algun campo que no cumpla con tal condicion se guardara en el objeto `errores`.

- Si el objeto `errores` no esta vacio el servidor responde con un **400 Bad request** devolviendo un json `error` que contendra los errores que se produjeron.

--- 


5. **Exito & next**

```js
req.recovery = sanitized

next()
```

- Si se pasa las validaciones creamos la propiedad `recovery` en el objeto `req` donde guardaremos los datos ya limpios para su posterior uso.

- Llamos a `next()` que nos para al siguiente controlador `recoveryPasswordGuard`.

---

## Exportación

```javascript
module.exports = recoveryPasswordValidations
```

Permite importar este middleware en ruta de usuario:

```js
router.post('/recuperar-password', limiter, recoveryPasswordValidations, recoveryPasswordGuard, userController.recuperarPassword)

```

---