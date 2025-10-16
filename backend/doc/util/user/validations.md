
# 🧩 Validaciones de Usuario - Documentación

Este módulo contiene funciones reutilizables para validar los distintos campos del formulario de usuario.
Está diseñado para ser utilizado tanto en operaciones **POST (registro)** como en **PUT (actualización)**.

---

## 📄 Descripción General

Cada función realiza validaciones básicas sobre los valores recibidos y devuelve un **string** con el mensaje de error correspondiente.  
Si no hay errores, devuelve `null`.

Estas funciones se encuentran en:  
`utils/user/validations.js`

---

## 🧱 Funciones de Validación

### 🔹 `userNameValidations(userName)`
Valida el nombre de usuario.

**Reglas:**
- Debe existir y no estar vacío.
- Mínimo 5 caracteres.
- Máximo 15 caracteres.

**Retorna:**  
- Mensaje de error (`string`) o `null` si es válido.

---

### 🔹 `emailValidations(email)`
Valida el formato del correo electrónico.

**Reglas:**
- No debe estar vacío.
- No debe contener espacios.
- Debe cumplir con el formato válido de email (`usuario@dominio.com`).

**Expresión regular usada:**
```js
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

**Retorna:**  
- Mensaje de error (`string`) o `null`.

---

### 🔹 `passwordValidations(password)`
Valida la contraseña principal.

**Reglas:**
- No debe estar vacía.
- Mínimo 6 caracteres.
- No puede contener espacios.

**Retorna:**  
- Mensaje de error (`string`) o `null`.

---

### 🔹 `password2Validations(password, password2)`
Valida la confirmación de contraseña.

**Reglas:**
- No debe estar vacía.
- Debe coincidir con `password`.

**Retorna:**  
- Mensaje de error (`string`) o `null`.

---

### 🔹 `preguntaValidation(pregunta)`
Valida la pregunta de seguridad.

**Reglas:**
- No debe estar vacía.

**Retorna:**  
- Mensaje de error (`string`) o `null`.

---

### 🔹 `respuestaValidations(respuesta)`
Valida la respuesta de seguridad.

**Reglas:**
- No debe estar vacía.
- Mínimo 5 caracteres.
- Máximo 30 caracteres.

**Retorna:**  
- Mensaje de error (`string`) o `null`.

---

### 🔹 `claveValidation(clave)`
Valida la **clave secreta de administrador**.

**Reglas:**
- No debe estar vacía.
- Debe coincidir con la clave almacenada en la variable `KEY` del archivo `config.js`.

**Retorna:**  
- `"Ingrese la clave"` si está vacía.  
- `"Clave incorrecta"` si no coincide.  
- `null` si es válida.

---

## 🧠 Buenas Prácticas Aplicadas

✅ Cada función se enfoca en **una sola responsabilidad**.  
✅ Se devuelven errores como **strings simples** (más fácil de mapear en middlewares).  
✅ Reutilizable en cualquier flujo (registro, login, recuperación, actualización).  
✅ Código limpio, modular y testeable.

---

## 📦 Exportaciones

```js
module.exports = {
    userNameValidations,
    emailValidations,
    passwordValidations,
    password2Validations,
    preguntaValidation,
    respuestaValidations,
    claveValidation
}
```

---

✍️ **Autor:** Bruno  
💾 **Propósito:** Validaciones consistentes y reutilizables para todos los formularios de usuario.
