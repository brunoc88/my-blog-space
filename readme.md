# 📝 My Blog Space — API REST para blogs sociales

## 📖 Descripción general

**My Blog Space** es una API REST desarrollada con Node.js, Express y MongoDB que permite a los usuarios crear, gestionar y compartir blogs personales.
El sistema implementa autenticación JWT, control de roles (usuarios y administradores), permisos granulares, manejo de visibilidad, comentarios, likes y sistema de bloqueos entre usuarios.

---

## 🚀 Funcionalidades principales

### 🧍‍♂️ Autenticación y usuarios

* Registro y login con JWT.
* Dos tipos de registro:

  * **Usuario común**
  * **Administrador** (requiere una clave especial).
* Recuperación de contraseña con pregunta de seguridad y límite de intentos (bloqueo temporal por IP si se excede).
* Edición de perfil, incluyendo visibilidad de cuenta (pública/privada) y contraseña.
* Eliminación de cuenta por el propio usuario o un admin (no se pueden eliminar cuentas entre admins).

### ✍️ Creación y gestión de blogs

* Solo usuarios **registrados y autenticados** pueden crear blogs.
* El blog puede ser:

  * **Público:** visible para todos.
  * **Privado:** visible solo para el autor (los comentarios se desactivan automáticamente).
* Opcional: imagen de portada.
* Hasta **5 etiquetas** por blog (tags gestionados por administradores).
* Cambio de visibilidad y configuración de comentarios posterior.

### 💬 Interacciones con blogs

* Se puede **dar like, dislike, comentar y agregar a favoritos**.
* Estas acciones solo son posibles si:

  * El autor del blog **no bloqueó** al usuario.
  * El blog **es público**.

---

## 🛡️ Permisos y roles

### 🔧 Blogs

* **Eliminar blog:**

  * Autorizado: el autor o un admin.
  * Restricción: un admin **no puede eliminar** blogs de otro admin.
* **Editar blog, visibilidad o comentarios:**

  * Solo el autor del blog.

### 💭 Comentarios

* **Comentar:** cualquier usuario autenticado.
* **Editar:** solo el autor del comentario.
* **Eliminar:** puede hacerlo el autor del comentario, el autor del blog o un admin.
  * No hay privilegios especiales para admins (pueden eliminar comentarios de admins también).
* **Like:** se puede dar like a un comentario.

### 🔗 Seguimientos

* Cualquier usuario puede seguir a otro **si no está bloqueado**.
* Si la cuenta del usuario objetivo es privada, se genera una **solicitud de seguimiento pendiente**.
* Las solicitudes deben ser aceptadas o rechazadas por el usuario objetivo.

### 🚫 Bloqueos

* Un usuario puede bloquear a otro para evitar interacciones (likes, comentarios, follows, etc.).
* **Los administradores no pueden bloquearse entre sí.**

---

## 🏷️ Etiquetas (Tags)

* Solo los administradores pueden **crear, actualizar o desactivar** etiquetas.
* Los blogs pueden tener hasta **5 etiquetas activas**.

---

## 👀 Visibilidad de cuentas y blogs

* Las **cuentas privadas** no muestran sus blogs ni su lista de favoritos.
* Las **cuentas públicas** muestran sus blogs visibles y su perfil.

---

## 🧠 Seguridad

* Límite de intentos en registro y recuperación de contraseña (bloqueo por IP).
* Validaciones y sanitización de datos de entrada.
* Autenticación segura mediante JWT + cookies opcionales.
* Control de permisos por rol y autoría en cada acción.

---

## 🧩 Tecnologías principales

* **Backend:** Node.js, Express.js
* **Base de datos:** MongoDB + Mongoose
* **Autenticación:** JWT
* **Testing:** Jest + Supertest
* **Validaciones:** Middlewares personalizados y utilidades
* **Arquitectura:** MVC modular con middlewares de permisos

---

## 📄 Licencia

Proyecto desarrollado por **Bruno** — uso educativo y demostrativo.
