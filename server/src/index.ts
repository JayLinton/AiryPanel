import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import settingsRoutes from './routes/settings.js';
import adminRoutes from './routes/admin.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 静态文件（生产环境）
const distPath = join(__dirname, '../../dist');
app.use(express.static(distPath));
app.get('{*path}', (_req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`✅ Inkflow 服务器已启动: http://localhost:${PORT}`);
});
