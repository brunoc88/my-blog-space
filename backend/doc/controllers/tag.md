# 🏷️ Controlador de Etiquetas(Tag)

Este archivo contiene el controlador para manejar las funcionalidades relacionadas con la creacion, edicion, activacion, desactivacion y listado de etiquetas.

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

## Flujo de `crearEtiqueta`

- Se extrae el campo `nombre` de `req.body` ya validado por el middleware `tagValidations`.
- Se crea una nueva instancia de etiqueta.
- Procedemos a guardar en la base de datos.
- En caso de exito el controlador devuelve una respuesta con estado **201 Created** junto con un json.


### Ejemplo de respuesta
```js
{
    mensaje:'Etiqueta creada con éxito',
    tag: {
        id: '690e7d13c9c5a66cb3728509'
        nombre:'horror',
        estado: true
    }
}

```

---

## 📌 `desactivar`

Descativa una etiqueta que se encuentra activa, seria como un borrado logico.

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
## Flujo de `desactivar`

- Se extra el `id` de `req.params`.
- Se procede a buscar la etiqueda por `id`.
- Si no se encuentra registro se devuelve un **404 Not Found** junto con un json.
- Si existe pero no esta activa se devuelve un **403 Forbidden** junto con un json.
- Si no hay errores se cambia su estado a `false` y se procese a guardar.
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
        id: '690e7d13c9c5a66cb3728509'
        nombre:'horror',
        estado: false
    }
}
```
