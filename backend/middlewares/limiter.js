const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // max 100 requests por IP en 15 minutos
  message: 'Demasiadas peticiones, intenta más tarde.'
})

module.exports = limiter