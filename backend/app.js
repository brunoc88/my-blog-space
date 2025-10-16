const express = require('express')
const app = express()
const path = require('path')

//importacion de middlewares
const unknowEndpoint = require('./middlewares/unknowEndpoint')
const errorHandler = require('./middlewares/errorHandler')
const morgan = require('morgan')

//importacion de rutas
const userRouter = require('./routes/user')


//aplicacion de middlewares
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))
app.use(express.json())

if(process.env.NODE_ENV === 'dev'){
    app.use(morgan('dev'))
}

app.use('/api/user',userRouter)

app.use(unknowEndpoint)
app.use(errorHandler)

module.exports = app