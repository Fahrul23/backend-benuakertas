import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import masterDataRoutes from './routes/masterData.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import calculatorRoutes from './routes/calculator.routes.js';

// __dirname equivalent untuk ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS - izinkan request dari client
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (mobile app, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} tidak diizinkan`));
  },
  credentials: true,
}));

// Helmet - security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Morgan - HTTP request logger
app.use(morgan('dev'));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Benua Kertas API is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

import orderRoutes from './routes/order.routes.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/master-data', masterDataRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/calculator', calculatorRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} tidak ditemukan.`,
  });
});

app.use(errorHandler);

export default app;
