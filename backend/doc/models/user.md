# 👥 Modelo de Usuario (User)

El modelo `User` permite la creacion y administracion de la cuenta del usuario. 

Acciones:
- Privatizar la cuenta
- Seguimientos
- Solicitudes de seguimiento
- Bloqueos
- Agregar un blog a favoritos
- Recuperacion de password

---

## 📟 Campos del esquema:

### `userName`
- **tipo:** `String`
- **requerido:** Sí
- **Único:** Sí
- **Restricciones:**
    - Mínimo 5 y máximo 15 caracteres
- **Descripción:** Nombre de usuario visible en el sistema.

---

### `email`
- **tipo:** `String`
- **requerido:** Sí
- **Único:** Sí
- **Validacion:** 
    - Email válido (usando validator.isEmail).
- **Descripción:** Correo electrónico asociado al usuario.

---

### `password`
- **tipo:** `String`
- **requerido:** Sí
- **Restricciones:**
    - Mínimo 6 caracteres
- **Descripción:** Contraseña del usuario (encriptada antes de guardar).

---

### `pregunta`
- **tipo:** `String`
- **requerido:** Sí
- **Descripción:** Pregunta secreta seleccionada desde un menú desplegable `(<select>)`, utilizada para recuperación de contraseña.

---

### `respuesta`
- **tipo:** `String`
- **requerido:** Sí
- **Restricciones:**
    - Mínimo 5 y máximo 30 caracteres
- **Descripción:** Respuesta secreta vinculada a la pregunta para recuperar contraseña.

---

### `rol`
- **tipo:** `String`
- **Valores posibles:** "admin" o "comun"
- **Descripción:** Define los permisos del usuario dentro de la plataforma.

---

### `imagen`
- **tipo:** `String`
- **Valor por defecto:** `default.png`
- **Descripción:** Imagen de perfil del usuario. Si no se proporciona una, se asigna una imagen por defecto.

---

### `suspendida`
- **tipo:** `Boolean`
- **Valor por defecto:** `false`
- **Descripción:** Indica si la cuenta está activa (false) o desactivada/baneada (true). Este campo se utiliza para restringir el acceso a funcionalidades.

---

### `bloqueos`
- **tipo:** `[objectId]`
- **referencia:** Modelo `User`
- **Descripción:** Lista de usuarios que el usuario ha bloqueado.

---

### `seguidos`
- **tipo:** `[objectId]`
- **referencia:** Modelo `User`
- **Descripción:** Lista de usuarios que el usuario sigue.

---

### `seguidores`
- **tipo:** `[objectId]`
- **referencia:** Modelo `User`
- **Descripción:** Lista de usuarios que siguen al usuario.

---

### `estado`
- **tipo:** `Boolean`
- **Valor por defecto:** `true`
- **Descripción:** Indica si la cuenta es `privada` o `publica`.

---

### `solicitudes`
- **tipo:** `[objectId]`
- **referencia:** Modelo `User`
- **Descripción:** Lista de solicitudes de seguimiento pendientes.

---

### `favoritos`
- **tipo:** `[objectId]`
- **referencia:** Modelo `Blog`
- **Descripción:** Lista de `blogs` favoritos del usuario.

---

## 🔐 Seguridad en la respuesta JSON

El modelo redefine toJSON para ocultar información sensible al devolver los datos al cliente:

```js
delete returnedObject._id
delete returnedObject.__v
delete returnedObject.password
```

Además, se agrega un campo id con el valor de _id como string para facilitar su uso en el frontend.