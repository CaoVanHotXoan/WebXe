const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const next = require('next');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const {
  getAllTablesData,
  getAllTablesDataObject,
  getTableData,
  allowedTables,
  createTableData,
  updateTableData,
  deleteTableData,
} = require('./controllers/dataController');

dotenv.config();

const PORT = Number(process.env.PORT) || 3002;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, hostname: 'localhost', port: PORT });
const handle = nextApp.getRequestHandler();
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());

const { swaggerSpec, swaggerUiOptions } = require('./config/swagger');

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

app.get('/api/data/json', getAllTablesData);
app.get('/api/data', getAllTablesData);

app.get('/api/data/view', async (req, res) => {
  try {
    const data = await getAllTablesDataObject();
    const tableBlocks = allowedTables.map((tableName) => {
      const rows = data[tableName] || [];
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      const previewRows = rows.slice(0, 3).map((row) => {
        const cells = columns.map((key) => `<td>${row[key] ?? ''}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');

      const header = columns.length > 0
        ? `<tr>${columns.map((key) => `<th>${key}</th>`).join('')}</tr>`
        : '<tr><th>Không có dữ liệu</th></tr>';

      return `
        <section class="table-block">
          <div class="table-header">
            <span class="table-tag">GET</span>
            <h3>${tableName}</h3>
          </div>
          <div class="table-wrap">
            <table>
              <thead>${header}</thead>
              <tbody>${previewRows || '<tr><td colspan="100%">Không có dữ liệu</td></tr>'}</tbody>
            </table>
          </div>
        </section>
      `;
    }).join('');

    res.send(`<!DOCTYPE html>
      <html lang="vi">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>WebXe API Data</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              background: #f4f4f4;
              color: #1f2937;
            }
            .topbar {
              background: #111827;
              color: #fff;
              padding: 20px 32px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 12px;
              font-weight: 700;
              font-size: 30px;
            }
            .brand-mark {
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: #4ade80;
              box-shadow: 0 0 12px rgba(74, 222, 128, 0.8);
            }
            .version {
              background: #d1fae5;
              color: #065f46;
              padding: 4px 10px;
              border-radius: 999px;
              font-size: 12px;
              font-weight: 700;
            }
            .page {
              max-width: 1200px;
              margin: 32px auto;
              padding: 0 20px 60px;
            }
            .title {
              font-size: 60px;
              margin: 0 0 12px;
              font-weight: 700;
            }
            .subtitle {
              font-size: 18px;
              color: #4b5563;
              margin-bottom: 30px;
            }
            .servers {
              margin: 30px 0 40px;
            }
            .server-label {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 10px;
            }
            .server-box {
              display: inline-block;
              border: 1px solid #374151;
              border-radius: 8px;
              padding: 12px 16px;
              background: #fff;
              font-size: 18px;
              min-width: 260px;
            }
            .table-block {
              background: #fff;
              border: 1px solid #d1d5db;
              border-radius: 14px;
              overflow: hidden;
              margin-bottom: 28px;
              box-shadow: 0 1px 2px rgba(0,0,0,0.04);
            }
            .table-header {
              padding: 16px 20px;
              background: #d1fae5;
              display: flex;
              align-items: center;
              gap: 12px;
              border-bottom: 1px solid #a7f3d0;
            }
            .table-tag {
              display: inline-block;
              background: #10b981;
              color: #fff;
              border-radius: 6px;
              padding: 5px 10px;
              font-size: 12px;
              font-weight: 700;
            }
            .table-header h3 {
              margin: 0;
              font-size: 20px;
            }
            .table-wrap {
              overflow-x: auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              min-width: 420px;
            }
            th, td {
              border: 1px solid #e5e7eb;
              padding: 10px 12px;
              text-align: left;
              vertical-align: top;
              font-size: 14px;
            }
            th {
              background: #f3f4f6;
              color: #111827;
            }
            tbody tr:nth-child(even) {
              background: #f9fafb;
            }
            @media (max-width: 768px) {
              .title { font-size: 40px; }
              .brand { font-size: 22px; }
            }
          </style>
        </head>
        <body>
          <header class="topbar">
            <div class="brand">
              <span class="brand-mark"></span>
              <span>Swagger</span>
            </div>
            <span class="version">v 3.0</span>
          </header>

          <main class="page">
            <h1 class="title">WebXe API</h1>
            <div class="subtitle">API quản lý xe</div>

            <div class="servers">
              <div class="server-label">Servers</div>
              <div class="server-box">http://localhost:3002</div>
            </div>

            ${tableBlocks}
          </main>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Lỗi render /api/data/view:', error);
    res.status(500).json({ message: 'Không thể render dữ liệu API', error: error.message });
  }
});

app.get('/api/data/:table', getTableData);
app.post('/api/data/:table', createTableData);
app.put('/api/data/:table', updateTableData);
app.delete('/api/data/:table', deleteTableData);
app.use('/api/auth', authRoutes);

connectDB();

nextApp.prepare().then(() => {
  app.use((req, res) => {
    return handle(req, res);
  });

  app.listen(PORT, () => {
    console.log(`🚀 WebXe custom server đang chạy trên port ${PORT}`);
    console.log(`📘 Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log(`🌐 Next.js app: http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Không thể khởi động Next.js:', error);
  process.exit(1);
});
