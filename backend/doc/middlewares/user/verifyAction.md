# Middleware: verifyAction

Se encarga de verificar las acciones entre usuarios: bloqueos, seguimiento y solicitudes de seguimiento.

## Importación

```js
const User = require('../../models/user')
```

Importamos el Modelo `User` para las consultas.

---

## Flujo del middleware

```js
const verifyAction = (accion) => async (req, res, next) =>
```

1. **Extraccion & asignacion**.

```js
const { id } = req.params
        const user = await User.findById(id)
        const myUser = await User.findById(req.user.id)
```

- Extraemos el `id` de `req.params`.
- Declarmos las variables `user` & `myUser`.
- La primera guardara los datos del usuario a buscar y la segunda mis datos personales.

---

2. **Comprobar estado de cuenta**.

```js
if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' })
        if (user.suspendida) return res.status(403).json({ mensaje: 'Cuenta eliminada' })
```

- Si la cuenta no existe se responde con un **404**.
- Si la cuenta existe pero esta suspendida se responder con un **403**.

---

3. **Verificar accion**

```js
if (accion === 'bloqueo') {
            const isBlocked = myUser.bloqueos.some(u => u.toString() === id)
            if (!isBlocked) return res.status(404).json({ mensaje: 'El usuario no está en tu lista de bloqueos' })
        }

        if (accion === 'seguimiento') {
            const isFollowed = myUser.seguidos.some(u => u.toString() === id)
            if (!isFollowed) return res.status(404).json({ mensaje: 'El usuario no está en tu lista de seguidos' })
        }

        if(accion === 'solicitud') {
            const isRequested = myUser.solicitudes.some(u => u.toString() === id)
            if (!isRequested) return res.status(404).json({ mensaje: 'El usuario ya no esta en tu lista de solicitudes' }) 
        }
```
**Acciones**
    `Bloqueo:`
        - Se busca en mi lista de bloqueados el usuario a desbloquear.
        - Si no esta bloqueado se responde con un **404**.
    `seguimiento:`
        - Se busca en mi lista de seguidos el usuario que ya no queremos seguir.
        - Si no esta se responde con un **404**.
    `solicitudes:`
        - Se busca en mi lista de solicitudes al usuario para aceptar o rechazar su solicitud.
        - Si no se encuentra en mi lista se responder con un **404**

---

4. **Exito**

```js
 req.myUser = myUser
        req.userTo = user

        next()
```

- Si no hay problemas en la accion seleccionada se procerede a guardar mi informacion en `req.myUser` y la del usuario `req.userTo` para poder ser usada en los controladores que lo requieran.

- Llamamos a next para continuar con el siguiente controlador dependiendo la accion.

---

## Exportación

```js
module.exports = verifyAction
```

Permite importar este middleware en rutas de usuario:

```js
router.patch('/desbloquear/:id', verifyAction('bloqueo'), userController.desbloquear)

router.patch('/noSeguir/:id', verifyAction('seguimiento'), userController.dejarDeSeguir)

router.patch('/solicitud/aceptar/:id', verifyBlock, verifyAction('solicitud'), userController.aceptarSolicitud)

router.patch('/solicitud/rechazar/:id', verifyAction('solicitud'), userController.rechazarSolicitud)

```
    