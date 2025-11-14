# Middleware: VerifyBlockPermissions

Middleware encargado del bloqueo entre usuarios segun su rol


## Flujo del middleware

1.**Extraccion de datos**

```js
const { yo, userTo } = req
```

- Extraemos el objeto `req` proveniente de  `verifyBlock` mis datos y del usuario a bloquear.

---


2.**Asignacion segun los casos**

```js
const isSelf = yo.id === userTo.id
    const bothAdmin = yo.rol === 'admin' && userTo.rol === 'admin'
    const userIsAdminAndMineIsComun = yo.rol === 'comun' && userTo.rol === 'admin'
```

- Asignamos en variables los futuros casos a evaluar.

---


3.**Validaciones**

```js
if (isSelf)
        return res.status(400).json({ mensaje: 'No puedes bloquearte a ti mismo' })
    if (bothAdmin)
        return res.status(400).json({ mensaje: 'No puedes bloquear a otro admin' })
    if (userIsAdminAndMineIsComun)
        return res.status(400).json({ mensaje: 'No puedes bloquear a un admin' })
```

- Si el usuario a bloquear es la misma persona.
- Si ambos usuarios son rol admin.
- Si el usuario a bloquear es rol admin y yo un usuario comun.
- En cualquiera de estas validaciones se devolvera un **400** junto con un mensaje.

---

4.**Exito**

```js
next()
```

- Si no hay problemas se llama a `next()` donde el proceso continuara en el controlador `userController.bloquear`.

---

## Exportación

```js
module.exports = verifyBlockPermissions
```

Permite importar este middleware en ruta de usuario:

```js
router.patch('/bloquear/:id', verifyBlock, verifyBlockPermissions, userController.bloquear)
```