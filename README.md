API REST Versionada con JWT y Swagger.

Proyecto de práctica backend desarrollado con Node.js y Express que implementa una API REST versionada con autenticación JWT, rate limiting, logging, documentación OpenAPI automática y webhooks. 
Tecnologías utilizadas: Node.js, Express, JWT (jsonwebtoken), express-rate-limit, morgan, Swagger/OpenAPI y Webhooks. 
Para ejecutar el proyecto instalar dependencias con `npm install` y luego ejecutar el servidor con `node api-rest-completa-versionada.js`. 
El servidor queda disponible en http://localhost:3000. 
IMPORTANTE: la ruta `/login` NO se abre en el navegador porque es un endpoint POST. 
La ruta correcta para usar en el navegador es http://localhost:3000/docs, donde se encuentra Swagger UI para probar todos los endpoints. 
Para autenticación JWT primero se debe obtener un token usando POST /login enviando un body 
JSON como `{ "user": "admin" }` y luego utilizar el token en los endpoints protegidos mediante el header `Authorization: Bearer TU_TOKEN`. 
Endpoints principales versión v2: POST /login, GET /api/v2/productos, POST /api/v2/productos, PUT /api/v2/productos/:id, DELETE /api/v2/productos/:id y POST /api/v2/webhooks. 
La base de datos es simulada en memoria y los webhooks se disparan al crear, actualizar o eliminar productos. 
Proyecto orientado a práctica y portfolio backend, nivel junior a semi-senior. 

Licencia: uso educativo.



