const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: process.env.NODE_ENV === 'test' ? 999999 : 5, // máximo 5 intentos por IP cada 5 minutos
  message: {
    error: 'Demasiadas solicitudes, intenta nuevamente en unos minutos.'
  },
  standardHeaders: true, // devuelve RateLimit-* headers
  legacyHeaders: false, // desactiva X-RateLimit-* headers antiguos
})

module.exports = limiter