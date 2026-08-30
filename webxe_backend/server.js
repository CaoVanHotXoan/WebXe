const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.SWAGGER_TITLE || 'WebXe API',
      version: process.env.SWAGGER_VERSION || '1.0.0',
      description: process.env.SWAGGER_DESCRIPTION || 'API quản lý xe',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.json({ message: 'API WebXe đang chạy' });
});

app.use('/api/auth', authRoutes);

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`📘 Swagger UI: http://localhost:${PORT}/api-docs`);
});
