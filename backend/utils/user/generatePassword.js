const crypto = require('crypto')

const generatePassword = (longitud = 12) => {
  return crypto.randomBytes(longitud).toString('hex').slice(0, longitud)  // ej: "a9d0e3f1b2c4"
}

module.exports = generatePassword