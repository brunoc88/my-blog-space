# Middleware: recoveryPasswordGuard

Middleware encargado de validar la recuperacion de password de un usuario.

## Importación

```js
const User = require('../../models/user')
```

Importamos el Modelo `User` para las consultas.

---

## Flujo del middleware

```js
const recoveryPasswordGuard = async (req, res, next) =>
```

1. **Extracción de datos del body**

```js
        let { email, pregunta, respuesta } = req.recovery

```

---

2. **Consulta sobre la existencia & estado de la cuenta**.

```js
        let user = await User.findOne({ email })

        if (!user) return res.status(404).json({ mensaje: 'Email no encontrado' })
        if (user.suspendida) return res.status(403).json({ mensaje: 'Cuenta eliminada' })

        if (user.pregunta !== pregunta || user.respuesta !== respuesta) {
            return res.status(400).json({ mensaje: 'Pregunta o respuesta incorrecta' })
        }
```

- Consultamos la existencia de cuenta mediante el `email` ingresado.

- Si el resultado es `null` el servidor respondera con un **404 Not Found**.

- Si la cuenta existe pero esta suspendia(`true`) retornara un **403**.

- Si la pregunta o la respuesta ingresada no concide con la registrada en la base de datos se responde con **404 Bad Request**.

---

3. **Exito & next**

```js
req.user = user
next()
```

- Ya pasadas las validaciones correctamente guardamos en el objeto `req.user` los datos del usuario.

- Llamados a `next()` que nos llevara al controlador `userController.recuperarPassword`.

---

## Exportación

```js
module.exports = recoveryPasswordGuard
```
Permite importar este middleware en ruta de usuario:

```js
router.post('/recuperar-password', limiter, recoveryPasswordValidations, recoveryPasswordGuard, userController.recuperarPassword)
```

---

