import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import 'dotenv/config';
import { swaggerSpec } from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import procedureRoutes from './routes/procedureRoutes.js';
import { getPool } from './config/db.js';
import catalogRoutes from './routes/catalogRoutes.js';

const app = express();
const port = Number(process.env.PORT || 5000);
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'webxe_backend' }));
app.get('/api/health/db', async (req, res, next) => {
  try {
    const result = await (await getPool()).request().query('SELECT DB_NAME() AS databaseName');
    return res.json({ status: 'ok', database: result.recordset[0].databaseName });
  } catch (error) {
    return next(error);
  }
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/data', catalogRoutes);
app.use('/api/admin', procedureRoutes);

app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy endpoint.' }));
app.use((error, req, res, next) => {
  console.error(error);
  return res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
});

app.listen(port, () => console.log(`WebXe backend đang chạy tại http://localhost:${port}`));
