# 🏷️ Controlador de Etiquetas(Tag)

Este archivo contiene el controlador encargado de manejar todas las operaciones relacionadas con las etiquetas: creación, edición, activación, desactivación y listado.

---

## 📌 `crearEtiqueta`

Sirve para crear una etiqueta.

```js
exports.crearEtiqueta = async (req, res, next) => {
    try {
        let { nombre } = req.body

        const nuevaEtiqueta = new Tag({ nombre })

        const etiquetaGuardada = await nuevaEtiqueta.save()

        res.status(201).json({
            mensaje: 'Etiqueta creada con éxito',
            tag: etiquetaGuardada
        })

    } catch (error) {
        next(error)
    }
}

```

### Flujo de `crearEtiqueta`

- Se extrae el campo `nombre` de `req.body` ya validado por el middleware `tagValidations`.
- Se crea una nueva instancia de Tag.
- Se guarda en la base de datos.
- Si tiene éxito, se devuelve una respuesta con estado **201 Created** y un objeto JSON con los datos de la etiqueta creada.


### Ejemplo de respuesta
```js
{
    mensaje:'Etiqueta creada con éxito',
    tag: {
        id: '690e7d13c9c5a66cb3728509',
        nombre:'horror',
        estado: true
    }
}

```

---

## 📌 `desactivar`

Desactiva una etiqueta activa (borrado lógico).

```js
exports.desactivar = async (req, res, next) => {
    try {
        const { id } = req.params

        let tag = await Tag.findById(id)

        if (!tag) return res.status(404).json({ error: 'Etiqueda no encontrada' })
        if (!tag.estado) return res.status(403).json({ error: 'Etiqueda ya desabilitada' })

        tag.estado = false
        await tag.save()

        return res.status(200).json({
            mensaje: 'Etiqueda desabilitada', tag: {
                id: tag.id,
                nombre: tag.nombre,
                estado: tag.estado,
            }
        })

    } catch (error) {
        next(error)
    }
}
```
### Flujo de `desactivar`

- Se extra el `id` del objeto `req.params`.
- Se busca la etiqueta correspondiente en la base de datos.
- Si no se encuentra registro se devuelve un **404 Not Found**.
- Si ya está deshabilitada, se devuelve un **403 Forbidden**.
- Si todo es correcto, se cambia su estado a `false` y se guarda.
- Finalmente el controlador devuelve como respuesta un **200 OK** junto con un json.

### Ejemplo de respuestas

- **Error:** 
```js
{
    error: 'Etiqueda no encontrada'
}
```
```js
{
    'Etiqueda ya desabilitada'
}
```
- **Exito:** 
```js
{
    mensaje: 'Etiqueda desabilitada',
    tag: {
        id: '690e7d13c9c5a66cb3728509',
        nombre:'horror',
        estado: false
    }
}
```

---

## 📌 `activar`

Permite activar una etiqueta previamente deshabilitada.

```js
exports.activar = async (req, res, next) => {
    try {
        const { id } = req.params

        let tag = await Tag.findById(id)

        if (!tag) return res.status(404).json({ error: 'Etiqueda no encontrada' })
        if (tag.estado) return res.status(403).json({ error: 'Etiqueda ya habilitada' })

        tag.estado = true
        await tag.save()

        return res.status(200).json({
            mensaje: 'Etiqueda habilitada', tag: {
                id: tag.id,
                nombre: tag.nombre,
                estado: tag.estado,
            }
        })

    } catch (error) {
        next(error)
    }
}

```
### Flujo de `activar`

- Se extra el `id` de `req.params`.
- Se procede a buscar la etiqueda por `id`.
- Si no se encuentra registro se devuelve un **404 Not Found**.
- Si ya está activa, se devuelve **403 Forbidden**.
- Si todo es correcto, se cambia el estado a `true` y se guarda.
- Finalmente se devuelve una respuesta con **200 OK** y los datos actualizados.

### Ejemplo de respuestas

- **Error:** 
```js
{
    error: 'Etiqueda no encontrada'
}
```
```js
{ error: 'Etiqueta ya habilitada' }

```
- **Exito:** 
```js
{
    mensaje: 'Etiqueda desabilitada',
    tag: {
        id: '690e7d13c9c5a66cb3728509',
        nombre:'horror',
        estado: true
    }
}
```

---

## 📌 `editar`

Permite cambiar el nombre de una etiqueta siempre y cuando esta exista, este activa y el nombre ingresado por el usuario pase el middleware `tagValidations`.

```js
exports.editar = async (req, res, next) => {
    try {
        const { id } = req.params
        let { nombre } = req.body

        let tag = await Tag.findById(id)

        if (!tag) return res.status(404).json({ error: 'Etiqueda no encontrada' })
        if (!tag.estado) return res.status(403).json({ error: 'Etiqueda desabilitada' })

        tag.nombre = nombre

        await tag.save()

        return res.status(200).json({ mensaje: 'Etiqueta actualizada', tag })

    } catch (error) {
        next(error)
    }
}
```

### Flujo de `editar`

- Se extra el `id` de `req.params`.
- Se procede a buscar la etiqueda por `id`.
- Si no se encuentra registro se devuelve un **404 Not Found** junto con un json.
- Si existe pero no esta activa se devuelve un **403 Forbidden** junto con un json.
- Si no hay errores se cambia el nombre y se procede a guardar.

### Ejemplo de respuesta
```js
{
    mensaje:'Etiqueta actualizada',
    tag: {
        id: '690e7d13c9c5a66cb3728509',
        nombre:'Terror',
        estado: true
    }
}

```

---

## 📌 `lista`

Permite obtener un listado de la etiquetas

```js
exports.lista = async (req, res, next) => {
    try {
        const etiquetas = await Tag.find({})
        return res.status(200).json({ etiquetas })
    } catch (error) {
        next(error)
    }
}
```

### Flujo de `lista`

- Se consulta a la base de datos por las etiquetas.
- El servidor devuelve un **200 OK** junto con un json.
- El array devuelto puede tener como no tener etiquetas guardadas.

### Ejemplo de respuesta
```js
{
    etiquetas: [{
        id: '690e7d13c9c5a66cb3728509',
        nombre:'Terror',
        estado: true
    },
    {
        id: '690e7d13c9c5a66cb3728510',
        nombre:'Accion',
        estado: true
    }
    ]
}

```

---