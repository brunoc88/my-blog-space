# Middleware: `tagValidations`

Middleware para la creacion y edicion de **etiquetas**.

---

## Flujo del middleware

```js
const tagValidations = (req, res, next) =>
```
### 1. Extracción de datos del body y sanitizacion

```js
    let { nombre } = req.body

    nombre = nombre?.trim().toLowerCase()

    // Reescribimos el valor ya sanitizado
    req.body.nombre = nombre
```
- Extraemos el campo `nombre` del req.body.
- Satinizamos el campo `nombre` eliminando los spacios al inicio y al final con `.trim()` y convertimos en minusculas con `.toLowerCase()`.
- Luego reasignamos el valor satinizado a `req.body.nombre`.

### 2. Validaciones 

```js
  if (!nombre || nombre.length === 0)
        return res.status(400).json({ error: 'Debe ingresar un nombre' })

    if (nombre.length < 2)
        return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' })

    if (nombre.length > 30)
        return res.status(400).json({ error: 'El nombre no puede tener más de 30 caracteres' })

    // Validar formato (solo letras, números, espacios y guiones)
    const regex = /^[a-z0-9áéíóúñ\s-]+$/i
    if (!regex.test(nombre))
        return res.status(400).json({
            error: 'El nombre solo puede contener letras, números, espacios y guiones'
        })
next()

```
- Validamos primero que el campo `nombre` no sea nulo o que contenga un valor.
- Si contiene un valor se comprueba si tiene mas de 2 caracteres.
- Se valida si ese valor no supere los 30 caracteres.
- Validamos que solo contenga letras, números, espacios y guiones.
- Finalmente si pasa todas estas validacion se llama a `next()` para continuar con el flujo normal.

---

## Exportación

```js
module.exports = tagValidations
```

Uso del middleware en rutas:

```js
router.post('/crear', tagValidations, tagController.crearEtiqueta)

router.patch('/editar/:id', tagValidations, tagController.editar)
```

---
