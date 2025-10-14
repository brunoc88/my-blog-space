const express = require('express')
const app = express()
const mongoose = require('mongoose')
const { MONGODB_URI } = require('./utils/config')

logger.info('Conectando a Base de datos')

mongoose.connect(MONGODB_URI)
    .then(() => {
        logger.info('Conexion a Base de datos exitosa!')
    })
    .catch((error) => {
        logger.error('Error al conectar a Base de datos: ', error.message)
    })

app.use(express.json())

app.get('/', (req, res) => {
    res.send('hola')
})

module.exports = app