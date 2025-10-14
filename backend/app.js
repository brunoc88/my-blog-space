const express = require('express')
const app = express()
const mongoose = require('mongoose')
const { MONGODB_URI } = require('./utils/config')
const logger = require('./utils/loggers')

//importacion de middlewares
const unknowEndpoint = require('./middlewares/unknowEndpoint')
const errorHandler = require('./middlewares/errorHandler')
const morgan = require('morgan')

logger.info('Conectando a Base de datos')

mongoose.connect(MONGODB_URI)
    .then(() => {
        logger.info('Conexion a Base de datos exitosa!')
    })
    .catch((error) => {
        logger.error('Error al conectar a Base de datos: ', error.message)
    })

app.use(express.json())

if(process.env.NODE_ENV === 'dev'){
    app.use(morgan('dev'))
}


app.use(unknowEndpoint)
app.use(errorHandler)

module.exports = app