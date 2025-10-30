const User = require('../models/user')
const bcrypt = require('bcrypt')

const loadUsers = async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)

    let user = new User({
        userName: 'fakeuser',
        email: 'fakeuser@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident Evil',
        password: passwordHash,
        rol: 'admin',
        suspendida: false
    })

    let user2 = new User({
        userName: 'fakeuser2',
        email: 'fakeuser2@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident Evil',
        password: passwordHash,
        rol: 'comun',
        suspendida: false,
        estado:false //<-- cuenta privada
    })

    let user3 = new User({
        userName: 'fakeuser3',
        email: 'fakeuser3@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident Evil',
        password: passwordHash,
        rol: 'comun',
        suspendida: true
    })

    let user4 = new User({
        userName: 'fakeuser4',
        email: 'fakeuser4@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident Evil',
        password: passwordHash,
        rol: 'admin',
        suspendida: false
    })

    let user5 = new User({
        userName: 'fakeuser5',
        email: 'fakeuser5@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident Evil',
        password: passwordHash,
        rol: 'comun',
        suspendida: false
    })

    let user6 = new User({
        userName: 'fakeuser6',
        email: 'fakeuser6@gmail.com',
        pregunta: 'Videojuego Favorito?',
        respuesta: 'Resident Evil',
        password: passwordHash,
        rol: 'admin',
        suspendida: false
    })


    await user.save()
    await user2.save()
    await user3.save()
    await user4.save()
    await user5.save()
    await user6.save()
}

const getUsers = async () => {
    let users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    loadUsers,
    getUsers
}