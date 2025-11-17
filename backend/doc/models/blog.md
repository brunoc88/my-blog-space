# 📄 Modelo de Blog

El modelo `Blog` permite la creacion y administracion de un blog.

Acciones:
- Privatizacion del blog
- Habilitacion de comentarios
- Restriccion de usuarios
- Likear Blog
- Likear comentario
- Comentar
- Agregar a favoritos

---

## 📟 Campos del esquema:

### `titulo`
- **tipo:** `String`
- **requerido:** Sí
- **Transformaciones:**
    - Se eliminan espacios extra con trim
- **Restricciones:**
    - Mínimo 5 y máximo 100 caracteres
    - El título solo puede contener letras, números y signos básicos
- **Descripción:** Nombre visible del blog.

---

### `imagen`
- **tipo:** `String`
- **Valor por defecto:** `''`
- **Descripción:** Imagen del blog. Si no se proporciona una, el blog se mostrara sin imagen.

---

### `nota`
- **tipo:** `String`
- **requerido:** Sí
- **Transformaciones:**
    - Se eliminan espacios extra con trim
- **Restricciones:**
    - Mínimo 20 y máximo 5000 caracteres
- **Descripción:** Contenido del blog.

---

### `tags`
- **tipo:** `[objectId]`
- **referencia:** Modelo `Tag`
- **Descripción:** Etiquetas que llevara el blog.

---

### `visibilidad`
- **tipo:** `Boolean`
- **requerido:** Sí
- **Descripción:** Permite selecciona si el blog va a ser `publico` o `privado`.

---

### `permitirComentarios`
- **tipo:** `Boolean`
- **requerido:** Sí
- **Descripción:** Para permitir o restringir comentar.

---

### `fecha`
- **tipo:** `Date`
- **Descripción:** Fecha de creacion del blog.

---

### `estado`
- **Tipo:** `Boolean`
- **Valor por defecto:** `true`
- **Descripción:** Indica si el blog está activo (`true`) o desactivado (`false`).

---

### `autor`
- **Tipo:** `ObjectId`
- **referencia:** Modelo `User`
- **Descripción:** Autor del blog.

---

### `likes`
- **tipo:** `[objectId]`
- **referencia:** Modelo `User`
- **Descripción:** Lista de usuarios que le dieron like al blog.

--- 

### `dislikes`
- **tipo:** `[objectId]`
- **referencia:** Modelo `User`
- **Descripción:** Lista de usuarios que le dieron dislike al blog.

---

### `favoritos`
- **tipo:** `[objectId]`
- **referencia:** Modelo `User`
- **Descripción:** Lista de usuario que agregaro el blog a sus favoritos.

---

### `comentarios`
- **tipo:** Subdocumento embebido (comentarioSchema)
- **Descripción:** Comentarios hechos por otros usuarios sobre el blog.

---



