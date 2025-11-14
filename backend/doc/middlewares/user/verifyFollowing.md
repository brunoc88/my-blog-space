# Middleware: verifyFollowing

Se encarga de controlar el seguimiento entre usuarios.

## Flujo del middleware

1.**Extraccion de datos**

```js
const { id } = req.params
    const yo = req.yo
```

- Extraemos el `id` del usuario a seguir.
- Guardamos en variable `yo` mis datos obtenidos de `req.yo` provenientes de `verifyBlock`.

---

2.**Validaciones**

```js
    if (id === req.user.id) return res.status(400).json({ mensaje: 'No puedes seguirte a ti mismo' })

    // Chequeamos bloqueos (aseguramos que existan arrays)
    const misSeguidos = yo.seguidos || []

    if (misSeguidos.includes(id)) {
        return res.status(400).json({ mensaje: 'Ya sigues esta cuenta' })
    }
```

**Casos:**
    - Que el usuario intente seguirse a si mismo.
    - Seguir una cuenta que ya seguimos.
    - Cualquiera de los casos se devuelve un **400** con el mensaje de error correspondiente.

---

3.**Exito**

```js
next()
```

- Si no hubo ningun problema se procede a llamar a `next()` donde procederemos en `userController.seguir`.

---

## Exportación

```js
module.exports = verifyFollowing
```

Permite importar este middleware en ruta de usuario:

```js
router.patch('/seguir/:id', verifyBlock, verifyFollowing, userController.seguir)
```