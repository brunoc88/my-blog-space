const app = require('./app')
const logger = require('./utils/loggers')
const mongoose = require('mongoose')
const {MONGODB_URI, PORT } = require('./utils/config')

//conexion a la DB

logger.info('Conectando a Base de datos')

mongoose.connect(MONGODB_URI)
    .then(() => {
        logger.info('Conexion a Base de datos exitosa!')
    })
    .catch((error) => {
        logger.error('Error al conectar a Base de datos: ', error.message)
    })

app.listen(PORT, () => {
    logger.info(`Lisent PORT:${PORT}`)
})