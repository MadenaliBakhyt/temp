import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Serve uploaded files (for mock IPFS storage)
if (process.env.IPFS_MOCK === 'true') {
  const uploadsPath = process.env.IPFS_STORAGE_PATH || './uploads';
  app.use('/uploads', express.static(uploadsPath));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Server started successfully`);
  console.log('='.repeat(60));
  console.log(`Environment:     ${process.env.NODE_ENV || 'development'}`);
  console.log(`Port:            ${PORT}`);
  console.log(`CORS Origin:     ${CORS_ORIGIN}`);
  console.log(`IPFS Mock:       ${process.env.IPFS_MOCK === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log('='.repeat(60));
  console.log(`\n📍 Endpoints:`);
  console.log(`   Health:       http://localhost:${PORT}/health`);
  console.log(`   Auth:         http://localhost:${PORT}/api/auth/*`);
  console.log(`   Profile:      http://localhost:${PORT}/api/profile/*`);
  console.log('='.repeat(60));
  console.log(`\n✅ Ready to accept requests!\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  process.exit(0);
});

export default app;
