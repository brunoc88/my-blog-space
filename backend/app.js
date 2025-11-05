const express = require('express')
const app = express()
const path = require('path')

//importacion de middlewares
const unknowEndpoint = require('./middlewares/unknowEndpoint')
const errorHandler = require('./middlewares/errorHandler')
const { tokenExtractor } = require('./middlewares/authMiddleware')
const morgan = require('morgan')
const cors = require('cors')

//importacion de rutas
const loginRouter = require('./routes/login')
const userRouter = require('./routes/user')
const tagRouter = require('./routes/tag')
const blogRouter = require('./routes/blog')

//aplicacion de middlewares
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))
app.use(cors())
app.use(express.json())
app.use(tokenExtractor)

if (process.env.NODE_ENV === 'dev') {
    app.use(morgan('dev'))
}


app.use('/api', loginRouter)
app.use('/api/user', userRouter)
app.use('/api/tag', tagRouter)
app.use('/api/blog', blogRouter)

app.use(unknowEndpoint)
app.use(errorHandler)

module.exports = app