# 📄 Subdocumento Comentario (comentarioSchema)

Este subdocumento es utilizado dentro del modelo Blog para representar los comentarios que los usuarios realizan sobre el articulo. Cada comentario está vinculado a un usuario y cuenta con fecha de realización.

---

## 📟 Campos del esquema:

### `usuario`
- **Tipo:** `ObjectId`
- **referencia:** Modelo `User`
- **requerido:** Sí
- **Descripción:** Usuario que escribió el comentario.

---

### `mensaje`
- **Tipo:** `String`
- **requerido:** Sí
- **Restricciones:** 
    - Máximo 280 caracteres
- **Descripción:** Contenido del comentario.

---

### `fecha`
- **Tipo:** `Date`
- **Valor por defecto:** `Date.now`
- **Descripción:** Fecha del comentario.

---



