require('dotenv').config()

const PORT = process.env.PORT 

const MONGODB_URI = process.env.NODE_ENV === 'dev'? process.env.MONGODB_URI : process.env.MONGODB_URI_TEST

const SECRET = process.env.SECRET


module.exports = {
    PORT,
    MONGODB_URI,
    SECRET
}