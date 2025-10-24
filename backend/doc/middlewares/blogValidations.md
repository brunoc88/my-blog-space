# Middleware de Validación para Blogs

Este middleware se encarga de validar y sanitizar los datos que llegan desde un formulario para crear o actualizar un **blog**.

## Código

```javascript
const blogValidations = (req, res, next) => {
    let { titulo, nota, tags, visibilidad, permitirComentarios } = req.body
    const errores = {}

    // Validación de tipos
    let typeChecks = {
        titulo: 'string',
        nota: 'string',
        visibilidad: 'string',
        permitirComentarios: 'string'
    }

    for (const [campo, tipoEsperado] of Object.entries(typeChecks)) {
        if (campo in req.body && typeof req.body[campo] !== tipoEsperado) {
            errores[campo] = `El campo '${campo}' debe ser de tipo ${tipoEsperado}`
        }
    }

    if (Object.keys(errores).length > 0) {
        return res.status(400).json({ error: errores })
    }

    // Sanitización y conversión a booleanos
    let sanitized = {
        titulo: titulo?.trim(),
        nota: nota?.trim(),
        visibilidad: visibilidad === 'publico' ? true : false,
        tags,
        permitirComentarios: permitirComentarios === 'permitir' ? true : false
    }

    // Validaciones específicas
    if ('titulo' in req.body) {
        if (!sanitized.titulo || sanitized.titulo.length === 0) errores.titulo = 'El título es obligatorio'
        if (sanitized.titulo) {
            if (sanitized.titulo.length < 5) errores.titulo = 'El título debe tener al menos 5 caracteres'
            if (sanitized.titulo.length > 100) errores.titulo = 'El título no puede exceder 100 caracteres'

            const regex = /^[a-zA-Z0-9áéíóúñ\s.,!?-]+$/i
            if (!regex.test(sanitized.titulo)) {
                errores.titulo = 'El título solo puede contener letras, números y signos básicos'
            }
        }
    }

    if ('nota' in req.body) {
        if (!sanitized.nota || sanitized.nota.length === 0) errores.nota = 'La nota es obligatoria'
        if (sanitized.nota) {
            if (sanitized.nota.length < 20) errores.nota = 'La nota debe tener al menos 20 caracteres'
            if (sanitized.nota.length > 5000) errores.nota = 'La nota no puede exceder 5000 caracteres'
        }
    }

    if ('tags' in req.body) {
        if (!Array.isArray(tags)) {
            errores.tags = 'El campo "tags" debe ser un array'
        } else if (tags.length === 0) {
            errores.tags = 'Debe incluir al menos una etiqueta'
        }
    }

    if ('visibilidad' in req.body) {
        if (!visibilidad || visibilidad.length === 0) {
            errores.visibilidad = 'Debe seleccionar la visibilidad'
        } else {
            if (visibilidad !== 'publico' && visibilidad !== 'privado') {
                errores.visibilidad = 'Debe elegir entre publico o privado'
            }
        }
    }

    if ('permitirComentarios' in req.body) {
        if (!permitirComentarios || permitirComentarios.length === 0) {
            errores.permitirComentarios = 'Debe elegir si los comentarios van estar publicos o no'
        } else {
            if (permitirComentarios !== 'permitir' && permitirComentarios !== 'no permitir') {
                errores.permitirComentarios = 'Elija entre permitir y no permitir'
            }
        }
    }

    if (Object.keys(errores).length > 0) return res.status(400).json({ error: errores })

    req.body = sanitized
    next()
}

module.exports = blogValidations
```

## Explicación

1. **Validación de tipos:**  
   Se comprueba que los campos recibidos (`titulo`, `nota`, `visibilidad`, `permitirComentarios`) sean strings, ya que al enviar un formulario multipart/form-data todos los campos llegan como strings, incluso los que en el modelo son booleanos.

2. **Sanitización y conversión a booleanos:**  
   - `visibilidad`: `'publico'` → `true`, cualquier otro valor → `false`.  
   - `permitirComentarios`: `'permitir'` → `true`, `'no permitir'` → `false`.  
   Esto permite mantener la consistencia con el modelo de Mongoose, que define estos campos como booleanos.

3. **Validaciones específicas:**
   - `titulo`: obligatorio, entre 5 y 100 caracteres, solo letras, números y signos básicos.
   - `nota`: obligatorio, entre 20 y 5000 caracteres.
   - `tags`: debe ser un array con al menos una etiqueta.
   - `visibilidad` y `permitirComentarios`: solo valores válidos permitidos.

4. **Errores:**  
   Si se encuentra algún error, devuelve un JSON con los errores y status `400`.

5. **Flujo:**  
   Si todo está correcto, se sobrescribe `req.body` con los datos **sanitizados y convertidos**, y se llama a `next()` para que el flujo continúe.

