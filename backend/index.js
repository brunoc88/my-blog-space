const app = require('./app')
const logger = require('./utils/loggers')
const { PORT } = require('./utils/config')

app.listen(PORT, () => {
    logger.info(`Lisent PORT:${PORT}`)
})