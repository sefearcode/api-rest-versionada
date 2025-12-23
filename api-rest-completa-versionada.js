const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { v4: uuid } = require('uuid');

const app = express();
app.use(express.json());

/* ===============================
   CONFIGURACIÓN GENERAL
================================ */
const PORT = 3000;
const JWT_SECRET = 'clave-super-secreta';

/* ===============================
   LOGGING
================================ */
app.use(morgan('dev'));

/* ===============================
   RATE LIMITING
================================ */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
);

/* ===============================
   BASE DE DATOS SIMULADA
================================ */
let productos = [
  { id: 1, nombre: 'Laptop', precio: 1000, categoria: 'Electrónica', stock: 5, activo: true }
];
let siguienteId = 2;

/* ===============================
   WEBHOOKS
================================ */
let webhooks = [];

function dispararWebhooks(evento, data) {
  webhooks.forEach(hook => {
    fetch(hook.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evento, data })
    }).catch(() => {});
  });
}

/* ===============================
   MIDDLEWARE JWT
================================ */
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token requerido' });

  const token = header.split(' ')[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido' });
  }
}

/* ===============================
   LOGIN
================================ */
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login y obtención de JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token generado
 */
app.post('/login', (req, res) => {
  const token = jwt.sign({ user: req.body.user }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

/* ===============================
   API V2
================================ */
const router = express.Router();

/**
 * @swagger
 * /api/v2/productos:
 *   get:
 *     summary: Listar productos
 */
router.get('/productos', auth, (req, res) => {
  res.json(productos);
});

/**
 * @swagger
 * /api/v2/productos:
 *   post:
 *     summary: Crear producto
 */
router.post('/productos', auth, (req, res) => {
  const producto = {
    id: siguienteId++,
    ...req.body
  };
  productos.push(producto);
  dispararWebhooks('producto_creado', producto);
  res.status(201).json(producto);
});

/**
 * @swagger
 * /api/v2/productos/{id}:
 *   put:
 *     summary: Actualizar producto
 */
router.put('/productos/:id', auth, (req, res) => {
  const id = Number(req.params.id);
  const index = productos.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: 'No encontrado' });

  productos[index] = { ...productos[index], ...req.body };
  dispararWebhooks('producto_actualizado', productos[index]);
  res.json(productos[index]);
});

/**
 * @swagger
 * /api/v2/productos/{id}:
 *   delete:
 *     summary: Eliminar producto
 */
router.delete('/productos/:id', auth, (req, res) => {
  const id = Number(req.params.id);
  productos = productos.filter(p => p.id !== id);
  dispararWebhooks('producto_eliminado', { id });
  res.json({ success: true });
});

/**
 * @swagger
 * /api/v2/webhooks:
 *   post:
 *     summary: Registrar webhook
 */
router.post('/webhooks', auth, (req, res) => {
  const hook = { id: uuid(), url: req.body.url };
  webhooks.push(hook);
  res.status(201).json(hook);
});

app.use('/api/v2', router);

/* ===============================
   SWAGGER
================================ */
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API REST Versionada',
      version: '2.0'
    }
  },
  apis: ['./api-rest-completa-versionada.js']
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ===============================
   SERVIDOR
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
  console.log(`📘 Swagger en http://localhost:${PORT}/docs`);
});
