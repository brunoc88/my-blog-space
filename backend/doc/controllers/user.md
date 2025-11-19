# 👥 Controlador de Usuarios(User)

Este archivo contiene el controlador encargado de manejar todas las operaciones relacionadas con los usuarios: 

- Registro de usuarios `comun` o `admin`
- Recuperar password
- Eliminar/suspender cuenta
- Editar datos de cuenta
- Cambiar cuenta a publica o privada
- Bloquear usuario
- Desbloquear usuario
- Seguir usuario
- Dejar de seguir usuario
- Aceptar solicitud de seguimiento
- Rechazar solicitud de seguimiento
- Lista de bloqueados
- Lista de solicitudes
- Lista de seguidos
- Lista de seguidores
- Mi perfil
- Perfil de un usuario

---

## Importaciones 

```js
const User = require('../models/user')
const bcrypt = require('bcrypt')
const generatePassword = require('../utils/user/generatePassword')

```

- **User:** Modelo de `User` para hacer las operaciones.
- **bcrypt:** Dependencia para realizar `hash` y `compare`.
- **generatePassword:** Funcion auxiliar para generar un password temporal.

---

## Crear Usuario

```js
exports.crearUser = async (req, res, next) =>
```
### Flujo del controlador

```js
 const admin = req.params.admin
  const {
      userName,
      email,
      respuesta,
      pregunta,
      password
    } = req.body
```
1. Obtenemos el parametro `admin` de `req.params.admin`
2. Extreamos el los campos del objeto `req.body`

---

```js
const passwordHashed = await bcrypt.hash(password, 10)
```
3. Hasheamos el password que ingreso el usuario.

---

```js
 const newUser = new User({
      userName,
      email,
      imagen: req.file ? req.file.filename : 'default.png',
      respuesta,
      pregunta,
      rol: admin && req.body.clave === process.env.KEY
        ? 'admin'
        : 'comun'
      ,
      password: passwordHashed
    })
```

4. Creamos al usuario:
    - si el usuario ingreso una imagen se guarda sino se pondra una default.
    - si el parametro `admin` no es null y se ingreso la palabra secreta al usuario se le asignara el rol de admin.

---


```js
const savedUser = await newUser.save()

    return res.status(201).json({
      msj: 'Usuario guardado!',
      user: savedUser
    })
```

5. Guardamos el usuario y procedemos a responder la solicitud.

### Ejemplo de respuesta

```js
    {
        msj: 'Usuario guardado!',
        user: {
            id: '690e7d13c9c5a66cb3728509',
            userName: 'bruno88',
            email: 'bruno88@gmail.com',
            imagen: 'mi.png',
            pregunta:'Videojuego Favorito?',
            respuesta: 'Resident Evil 2',
            rol: 'comun',
            suspendida: false,
            estado: true
        }
    }
```

---

## Suspender cuenta 

```js
exports.suspenderCuenta = async (req, res, next) =>
```
### Flujo del controlador

```js
 let id = req.params.id
    await User.findByIdAndUpdate(id, { suspendida: true }, { new: true })
    return res.status(200).json({ mensaje: 'Cuenta suspendida' })
```

1. Obtenemos el id de `req.params.id`.
2. Buscamos el usuario por `id` y cambiamos el estado de `suspendida` a `true`.
3. Respondemos solicitud

### Ejemplo de respuesta

```js
{
    mensaje: 'Cuenta suspendida'
}
```

---

## Editar cuenta

```js
exports.editarCuenta = async (req, res, next) =>
```

### Flujo del controlador

```js
const { id } = req.user
    const cambios = req.body
```

1. Extraemos el `id` de `req.user` y `cambios` de `req.body`

---

```js
await User.findByIdAndUpdate(id, cambios)
```

2. Buscamos el `usuario` por `id` y mandamos los cambios realizados.

---

```js
return res.status(200).json({ mensaje: 'Datos acuatilzados', user: cambios })
```
3. Respondemos la solicitud

---

### Ejemplo de respuesta

```js
{
    mensaje: 'Datos acuatilzados',
    user:{
        email:'bruno1988@gmail.com'
    }
}
```

---

## Recuperar password

```js
exports.recuperarPassword = async (req, res, next) =>
```

### Flujo del controlador

```js
 let user = req.user
    const tempPassword = generatePassword()
    const hashed = await bcrypt.hash(tempPassword, 10)
```

1. Obtenemos los datos del usuario por `req.user`.
2. Llamamos a `generatePassword()` que nos generara un password generico.
3. Hasheamos el nuevo password.

---

```js
 user.password = hashed
    await user.save()

    return res.status(200).json({
      mensaje: 'Contraseña temporal generada correctamente',
      tempPassword
    })
```

4. procedemos a guardar el password temporal en el usuario.
5. Respondemos la solicitud.

---

## Cambiar visibilidad de cuenta

```js
exports.estado = async (req, res, next) => 
```

### Flujo del controlador

```js
 const user = await User.findById(req.user.id)

    if (user.estado) user.estado = false
    else user.estado = true
```

1. Buscamos el `user` por `id`.
2. Preguntamos si cuenta es `publica`.
3. Si es verdad se cambia a `privada` caso contrario a `publica`.

---

```js
await user.save()

    return res.status(200).json({ mensaje: `Tu cuenta ahora es ${user.estado ? 'publica' : 'privada'}`, user })
```

4. Actualizamos y respondemos la solicitud.

---

### Ejemplo de respuesta

```js
{
    mensaje: 'Tu cuenta ahora es privada',
    user: {
            id: '690e7d13c9c5a66cb3728509',
            userName: 'bruno88',
            email: 'bruno88@gmail.com',
            imagen: 'mi.png',
            pregunta:'Videojuego Favorito?',
            respuesta: 'Resident Evil 2',
            rol: 'comun',
            suspendida: false,
            estado: false
    }
}
```

---

## Seguir usuario

```js
exports.seguir = async (req, res, next) =>
```

### Flujo del controlador

```js
 const { id } = req.params
    let yo = req.yo
    let userTo = req.userTo
```

1. Obtenemos el `id` del usuario a seguir de `req.params`.
2. Guadamos en la variable `yo` mi informacion.
3. Guardamos en la variable `userTo` informacion del usuario a seguir.

---

**Privada**

```js
 if (!userTo.estado) {
      userTo.solicitudes.push(req.user.id)
      await userTo.save()
      return res.status(200).json({ mensaje: 'Tu solicitud fue enviada' })
    }
```
4. Preguntamos si la cuenta del usuario a seguir es `privada`.
5. Si es cierto guardamos en el array de `solicitudes` del usuario a seguir mi id:`req.user.id`.
6. Procemos a guardar y responder la solicitud.

---

**Publica**

```js
 yo.seguidos.push(id)
    userTo.seguidores.push(req.user.id)

    await yo.save()
    await userTo.save()

    return res.status(200).json({ mensaje: `Ahora sigues a ${userTo.userName}` })
```

4. Preguntamos si la cuenta del usuario a seguir es `privada`.
5. Si no lo es, procedemos a guardar el nustro `id` en el array de `seguidores` del usuario a seguir.
6. Guaramos los cambios en ambos usuarios y respondemos la solicitud.

---

### Ejemplo de respuestas

**Privada:**
```js
{
    mensaje: 'Tu solicitud fue enviada'
}
```

**Publica:**
```js
{
    mensaje: 'Ahora sigues a Jose99'
}
```

---

## Dejar de seguir Usuario

```js
exports.dejarDeSeguir = async (req, res, next) =>
```

### Flujo del controlador

```js
const { id } = req.params
    const { myUser, userTo } = req
    myUser.seguidos = myUser.seguidos.filter(u => u.toString() !== id)
    userTo.seguidores = userTo.seguidores.filter(u => u.toString() !== myUser.id)
```

1. Obtenemos el `id` de `req.params`.
2. Extraemos de `req` `myUser`(mi informacion) y `userTo`(usuario que seguimos).
3. Filtramos en el `array de seguidores` del usuario para devolver un array sin mi `id`.
4. Procedemos a hacer lo mismo con mi `array de seguidos` devolviendo un array sin el `id` del usuario.

---

```js
 await myUser.save()
    await userTo.save()
    return res.status(200).json({ mensaje: `Has dejado de seguir a ${userTo.userName}` })
```
5. Guardamos los cambios en ambas partes.
6. Respondemos la solicitud.

---

### Ejemplo de respuesta


```js
{
    mensaje: 'Has dejado de seguir a jose99'
}
```

---

## Bloquear usuario

```js
exports.bloquear = async (req, res, next) => 
```

### Flujo del controlador

```js
 const { yo, userTo } = req

    yo.bloqueos.push(userTo.id)
    await yo.save()

    return res.status(200).json({ mensaje: 'Usuario bloqueado' })
```

1. Extraemos de `req` `yo`(mi informacion) y `userTo`(informacion del usuario a bloquear).
2. Procemos a bloquear al usuario.
3. Guardamos los cambios.
4. Respondemos la solicitud.

---

### Ejemplo de respuesta


```js
{
    mensaje: 'Usuario bloqueado'
}
```

---

## Desbloquear usuario

```js
exports.desbloquear = async (req, res, next) => 
```

### Flujo del controlador

```js
 const { id } = req.params
    const { myUser, userTo } = req
    myUser.bloqueos = myUser.bloqueos.filter(u => u.toString() !== id)

    await myUser.save()
    return res.status(200).json({ mensaje: `Has desbloqueado a ${userTo.userName}` })
```
1. Obtenemos el `id` del usuario de `req.params`.
2. Extraemos de `req` `myUser`(mi informacion) y `userTo`(informacion del usuario a desbloquear).
3. Procemos a desbloquear al usuario.
4. Guardamos los cambios.
5. Respondemos la solicitud.

---

### Ejemplo de respuesta


```js
{
    mensaje: 'Has desbloqueado a jose99'
}
```

---

## Aceptar solicitud de seguimiento

```js
exports.aceptarSolicitud = async (req, res, next) =>
```
### Flujo del controlador

```js
let { userTo, myUser } = req

    // acepto y agrego
    myUser.seguidores.push(userTo.id)
    userTo.seguidos.push(myUser.id)
```

1. Obtenemos de `req` `userTo`(informacion del usuario que me quiere seguir) y `myUser`(mi informacion).
2. Agregamos al usuario a nuestro `array de seguidores`.
3. Agregamos al `array de seguidos` del usuario mi `id`.

```js
 // elimino la solicitud 
    myUser.solicitudes = myUser.solicitudes.filter(u => u.toString() !== userTo.id)

    await myUser.save()
    await userTo.save()

    return res.status(200).json({ mensaje: `${userTo.userName} ahora te sigue` })
```

4. Eliminamos la solicitud de mi `array de solicitudes`.
5. Guardamos los cambios en ambas partes.
6. Respondemos la solicitud.

---

### Ejemplo de respuesta


```js
{
    mensaje: 'jose99 ahora te sigue'
}
```

---

## Rechazar solicitud de seguimiento

```js
exports.rechazarSolicitud = async (req, res, next) => 
```

### Flujo del controlador

```js
 let { userTo, myUser } = req

    // elimino la solicitud 
    myUser.solicitudes = myUser.solicitudes.filter(u => u.toString() !== userTo.id)

    await myUser.save()

    return res.status(200).json({ mensaje: `Haz rechazado la solicitud de ${userTo.userName}` })

```

1. Extraemos de `req` `userTo`(informacion del usuario que vamos a rechazar solicitud) y `myUser`(mi informacion).
2. Eliminamos el `id` del usuario de mi `array de solicitudes`.
3. Guardamos los cambios.
4. Respondemos la solicitud.

---

### Ejemplo de respuesta


```js
{
    mensaje: 'Haz rechazado la solicitud de jose99'
}
```

---

## Lista de bloqueados

```js
exports.listaDeBloqueados = async (req, res, next) =>
```

### Flujo del controlador

```js
const user = await User.findById(req.user.id)
      .select('bloqueos')
      .populate('bloqueos', 'userName imagen suspendida')

    let bloqueados = user.bloqueos.filter(u => u.suspendida === false)

    return res.status(200).json({ bloqueados, cantidad: bloqueados.length })
```

1. Procedeo a buscarme en la base de datos.
2. Selecciono en esa busqueda el `array de bloqueos`.
3. Populo para que me devuelva la informacion de los usuarios ya que sino solo devolveria los `id`.
4. Filtro los usuarios que se encuentren activos.
5. Respondemos la solicitud devolviendo un array de bloqueos con usuarios activos y la cantidad de usuarios bloqueados activos.

---

### Ejemplo de respuesta


```js
{
    bloqueados: [
        {
            id: '690e7d13c9c5a66cb3728509',
            userName: 'bruno88',
            imagen:'default.png',
            suspendiad: false
        },
         {
            id: '690e7d13c9c5a66cb3728510',
            userName: 'jose99',
            imagen:'default.png',
            suspendiad: false
        }
    ],
    cantidad: 2
}
```

---


## Lista de Solicitudes

```js
exports.listaDeBloqueados = async (req, res, next) =>
```

### Flujo del controlador

```js
  const user = await User.findById(req.user.id)
      .select('solicitudes')
      .populate('solicitudes', 'userName imagen suspendida')

    let solicitudes = user.solicitudes.filter(u => u.suspendida === false)

    return res.status(200).json({ solicitudes, cantidad: solicitudes.length })
```

1. Procedeo a buscarme en la base de datos.
2. Selecciono en esa busqueda el `array de solicitudes`.
3. Populo para que me devuelva la informacion de los usuarios ya que sino solo devolveria los `id`.
4. Filtro los usuarios que se encuentren activos.
5. Respondemos la solicitud devolviendo un array de solicitudes con usuarios activos y la cantidad de usuarios solicitantes activos.

---

### Ejemplo de respuesta


```js
{
    solicitudes: [
        {
            id: '690e7d13c9c5a66cb3728509',
            userName: 'bruno88',
            imagen:'default.png',
            suspendiad: false
        },
         {
            id: '690e7d13c9c5a66cb3728510',
            userName: 'jose99',
            imagen:'default.png',
            suspendiad: false
        }
    ],
    cantidad: 2
}
```

---

## Lista de seguidos 

```js
exports.listaDeSeguidos = async (req, res, next) =>
```

### Flujo del controlador

```js
const user = await User.findById(req.user.id)
      .select('seguidos')
      .populate('seguidos', 'userName imagen suspendida')

    let seguidos = user.seguidos.filter(u => u.suspendida === false)
    return res.status(200).json({ seguidos, cantidad: seguidos.length })
```

1. Procedeo a buscarme en la base de datos.
2. Selecciono en esa busqueda el `array de seguidos`.
3. Populo para que me devuelva la informacion de los usuarios ya que sino solo devolveria los `id`.
4. Filtro los usuarios que se encuentren activos.
5. Respondemos la solicitud devolviendo un array de seguidos con usuarios activos y la cantidad de usuarios seguidos activos.

---

### Ejemplo de respuesta


```js
{
    seguidos: [
        {
            id: '690e7d13c9c5a66cb3728509',
            userName: 'bruno88',
            imagen:'default.png',
            suspendiad: false
        },
         {
            id: '690e7d13c9c5a66cb3728510',
            userName: 'jose99',
            imagen:'default.png',
            suspendiad: false
        }
    ],
    cantidad: 2
}
```

---

## Lista de seguidores

```js
exports.listaDeSeguidores = async (req, res, next) => 
```

### Flujo del controlador

```js
const user = await User.findById(req.user.id)
      .select('seguidores')
      .populate('seguidores', 'userName imagen suspendida')

    let seguidores = user.seguidores.filter(u => u.suspendida === false)

    return res.status(200).json({ seguidores, cantidad: seguidores.length })
```

1. Procedeo a buscarme en la base de datos.
2. Selecciono en esa busqueda el `array de seguidores`.
3. Populo para que me devuelva la informacion de los usuarios ya que sino solo devolveria los `id`.
4. Filtro los usuarios que se encuentren activos.
5. Respondemos la solicitud devolviendo un array de seguidores con usuarios activos y la cantidad de usuarios seguidores activos.

---

### Ejemplo de respuesta


```js
{
    seguidores: [
        {
            id: '690e7d13c9c5a66cb3728509',
            userName: 'bruno88',
            imagen:'default.png',
            suspendiad: false
        },
         {
            id: '690e7d13c9c5a66cb3728510',
            userName: 'jose99',
            imagen:'default.png',
            suspendiad: false
        }
    ],
    cantidad: 2
}
```

---

## Perfil

```js
exports.perfil = async (req, res, next) =>
```

### Flujo del controlador

```js
 const { id } = req.params
    let user = ''
    if (id) {
      user = await User.findById(id)
    } else {
      user = await User
        .findById(req.user.id)
        .populate({
          path: 'favoritos',
          match: { estado: true, visibilidad: true },
          select: 'titulo likes dislikes favoritos comentarios estado visibilidad'
        })
    }
    // devolvemos blogs activos y publicos
    return res.status(200).json({ user })
```

1. Obtenemos el `id` de `req.params`.
2. Declaramos la variable `user`.
3. Si el `id` no es null vemos el perfil del usuario.
4. Si el `id` es null busco mi perfil.
5. Populo mi `array de blogs favoritos` que esten `activos` y sean `publicos`.
6. Selecciono de `favoritos`: titulo, likes, dislikes, favoritos, comentarios, edatos, visibilidad.
7. Respondemos la solicidutd.

