# Documentación del Middleware de Rate Limit

Este middleware utiliza la librería **express-rate-limit** para limitar
la cantidad de solicitudes que un cliente puede realizar en un periodo
determinado.

## 📌 Código

``` js
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
```

## 📝 Descripción

Este limitador controla la cantidad de solicitudes por IP para prevenir
abusos, ataques de fuerza bruta y un uso excesivo de tus endpoints.

## ⚙️ Parámetros

-   **windowMs:** Duración de la ventana de tiempo (5 minutos).
-   **max:** Número máximo de solicitudes permitidas por IP.
    -   En modo test: `999999`
    -   En producción: `5`
-   **message:** Respuesta personalizada cuando se excede el límite.
-   **standardHeaders:** Incluye encabezados modernos de rate limit.
-   **legacyHeaders:** Desactiva encabezados antiguos.

## 🚀 Uso


``` js

router.post('/login', limiter, loginValidation, loginController.login)

router.post('/registro', limiter, upload.single('imagen'), userValidations, userController.crearUser)

router.post('/registro/:admin', limiter, upload.single('imagen'), userValidations, userController.crearUser)

router.post('/recuperar-password', limiter, recoveryPasswordValidations, recoveryPasswordGuard, userController.recuperarPassword)
```

Así, todas las rutas quedan protegidas automáticamente.

------------------------------------------------------------------------


