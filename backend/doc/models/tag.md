# 🏷️ Modelo de Etiquetas(Tag)

El modelo `Tag` permite a los usuarios registrados crear, listar y administrar etiquetas que sirven para clasificar las publicaciones (blogs) según su género, categoría o temática.

---

## 📟 Campos del esquema:

### `nombre`
- **tipo:** `String`
- **requerido:** Sí
- **Único:** Sí,
- **Restricciones:** 
    - Mínimo 2 y máximo 30 caracteres
    - Solo puede contener letras, números, espacios y guiones'
- **Transformaciones:**
    - Se convierte automáticamente a minúsculas
    - Se eliminan espacios extra con trim
- **Descripción:** Nombre de la etiqueta usada para clasificar los blogs.

---
### `estado`

- **Tipo:** `Boolean`
- **Valor por defecto:** `true`
- **Descripción:** Indica si la etiqueta está activa (`true`) o desactivada (`false`).

---

