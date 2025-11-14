# 🔐 Middleware: verifyBlock

Este middleware se encarga de validar si hay bloqueo entre usuarios antes de permitir acciones como las siguientes:

- Entre usuarios:
    - Seguir usuario.
    - Solicitudes de seguimiento.
    - Ver perfiles.

- Blogs:
    - Dar Like.
    - Quitar like. 
    - Comentar
    - Editar comentario.
    - Eliminar comentario.
    - Agregar a favoritos. 
    - Ver blogs de un usuario.
    - Ver un blog en particuilar donde este bloqueado por el autor.

---

## Importación

```js
const User = require('../../models/user')
```

Importamos el Modelo `User` para las consultas.

---

## Flujo del middleware

```js
const verifyBlock = async (req, res, next) =>
```

1.**Extraccion de datos**.

```js
const { id } = req.params
    const { userTo } = req // <-- proveniente de verifyActionBlog
```

- Extraemos de `req.params` el `id`.
- Extraemos de `req` informacion del usuario `userTo` (autor del blog) proveniente de `verifyActionBlog`.

---

2.**Guardo mi informacion**

```js
const yo = await User.findById(req.user.id)
```
---

3.**Salteo de middleware**

```js
    if (req.favs) {
      req.yo = yo
      return next()
    } //<-- si fav proviente de verifyActionBlog es verdad salteamos este middleware
```

- Si por casualidad queremos dejar de tener un blog de favorito donde el autor nos haya bloqueo saltamos la validacion y guardamos nuesta info en `req.yo`.

---

4.**Obtencion de infomacion completa de usuario**

```js
let user = ''
    if (userTo) {
      user = await User.findById(userTo.id)
    } else {
      user = await User.findById(id)
    }
```

- Si `userTo` no es null buscamos al usuario por `userTo.id` caso contrario sera por `id`.

---

5.**Comprobacion del estado de cuenta**

```js
if (!user) return res.status(404).json({ mensaje: 'Cuenta no encontrada' })
    if (user.suspendida) return res.status(403).json({ mensaje: 'Cuenta eliminada' })
```

- Si la cuenta no existe se responde con un **404**.
- Si existe pero esta suspendida se responde con un **403**.

---

6.**Chequeo de bloqueos**

```js
 // Chequeamos bloqueos (aseguramos que existan arrays)
    const misBloqueados = yo.bloqueos || []
    const susBloqueados = user.bloqueos || []


    if (misBloqueados.includes(user.id)) {
      return res.status(400).json({ mensaje: `Tienes bloqueado a ${user.userName}` })
    }

    if (susBloqueados.includes(req.user.id)) {
      return res.status(400).json({ mensaje: `${user.userName} te ha bloqueado` })
    }
```

- Se comprueba que no exista bloqueos por ambos lados.
- Si existe se devolvera un **404**

---

5.**Exito**

```js
req.yo = yo
    req.userTo = user
    next()
```

- Si no hay problemas pasaremos al siguiente middleware y/o controlador segun la ruta.

---

## Exportación

```js
module.exports = verifyBlock
```

Permite importar este middleware en rutas de usuario y blog.

**Rutas de usuario:**

```js
router.patch('/bloquear/:id', verifyBlock, verifyBlockPermissions, userController.bloquear)

router.patch('/seguir/:id', verifyBlock, verifyFollowing, userController.seguir)

router.patch('/solicitud/aceptar/:id', verifyBlock, verifyAction('solicitud'), userController.aceptarSolicitud)

router.get('/:id/perfil', verifyBlock, userController.perfil)

```
**Rutas de blog:**

```js

router.patch('/:id/like', verifyBlogAction('like'), verifyBlock, blogController.like)

router.patch('/:id/dislike', verifyBlogAction('dislike'), verifyBlock, blogController.disLike)

router.patch('/:id/fav', verifyBlogAction('favoritos'), verifyBlock, blogController.fav)

router.post('/:id/comentar',verifyBlogAction('comentar'), verifyBlock, blogController.comentar)

router.patch('/:id/comentar/:idComment', blogPermissions('editar comentario'), verifyBlogAction('editar comentario'), verifyBlock, blogController.editarComentario)

router.delete('/:id/comentar/:idComment', blogPermissions('eliminar comentario'), verifyBlock, blogController.eliminarComentario)

router.patch('/:id/comentar/:idComment/like', blogPermissions('like comentario'), verifyBlock, blogController.likeComentario)

router.get('/user-blogs/:id', verifyBlock, blogController.userBlogs)

router.get('/:id', blogPermissions('ver blog'), verifyBlock, blogController.getBlog)

```







