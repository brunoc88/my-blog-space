# Middleware: suspensionGuard

Middleware encargado de validar la suspesion y/o eliminacion de cuenta de usuario.

## Importación

```js
const User = require('../../models/user')
```

Importamos el Modelo `User` para las consultas.

---

## Flujo del middleware

1. **Asignacion de mis datos y extraccion del id**

```js
const miUser = req.user
const { id } = req.params
```

- Asignamos en la variable `miUser` mis datos guardados `req.user` al estar logueado.

- Extraemos de `req.params` el `id`.

---

2. **Busqueda de cuenta & estado de la misma**.

```js
const user = await User.findById(id);
        if (!user) return res.status(404).json({ error: 'Cuenta inexistente' })
        if (user.suspendida) return res.status(403).json({ error: 'Cuenta suspendida' })
```

- Se procede a buscar la cuenta mediante el `id`.

- Si la cuenta no existe el servidor respondera con un **404 Not Found**.

- Si la cuenta existe pero esta suspendia se responde con un **403**.

---

3. **Verificacion de rol**

```js
const sameId = user.id === miUser.id // Chequeamos que sean mismo id
        const bothAdmins = user.rol === 'admin' && miUser.rol === 'admin' // Si ambos son admin
        const userIsAdminAndMineIsComun = miUser.rol === 'comun' && user.rol === 'admin'
        const bothCommons = miUser.rol === 'comun' && user.rol === 'comun' // Si ambos son comun
```

- Una vez comprobada la existencia de la cuenta buscada y que la misma este activa pasamos a asignar en variables los posibles casos para poder suspender la cuenta.

Casos en los que no se puede eliminar una cuenta: 

```js
 if (!sameId && bothAdmins) {
            return res.status(403).json({ error: 'Un admin no puede suspender a otro admin' });
        }

        if (!sameId && userIsAdminAndMineIsComun) {
            return res.status(403).json({ error: 'No puedes suspender a un admin' });
        }

        if (!sameId && bothCommons) {
            return res.status(403).json({ error: 'No puedes suspender a otro usuario' });
        }
```
- Si el `id` es diferente del usuario logueado pero ambos son rol `admin`

- Si el `id` es diferente del usuario logueado y la cuenta a suspender es de un `admin` mientras que yo soy un usuario `comun`.

- Si el `id` es diferente del usuario logueado y ambos somos simples usuarios `comun`.

- En cada uno de estos casos se devolvera un **403** con un json explicando el `error`.

---


4. **Exito**

```js
next()
```

- Si no hubo ningun problema y todo es valido pasariamos al controllador `userController.suspenderCuenta`.

---

## Exportación

```js
module.exports = suspensionGuard
```

Permite importar este middleware en ruta de usuario:

```js
router.patch('/:id/suspender', suspensionGuard, userController.suspenderCuenta)

```
