import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Route files
import authRoutes from '../../routes/auth.routes.js';
import contactRoutes from '../../routes/contact.routes.js';

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, or same-origin)
      if (!origin) return callback(null, true);
      
      const cleanOrigin = origin.replace(/\/$/, '');
      const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : '';
      
      const isAllowed =
        cleanOrigin === 'http://localhost:5173' ||
        cleanOrigin === 'http://127.0.0.1:5173' ||
        (clientUrl && cleanOrigin === clientUrl) ||
        cleanOrigin === 'https://the-monolith-henna.vercel.app' ||
        cleanOrigin.endsWith('.vercel.app'); // Allow Vercel preview domains
        
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Required for cookies to be sent cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body + Cookie parsers ─────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ── Global rate limiter ───────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use(globalLimiter);

// Stricter limiter specifically for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Try again in 15 minutes.' },
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/contact', contactRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'The Monoliths API is running.', uptime: process.uptime() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  // Helpful 404 for API consumers: if they hit an /api/* path, include known endpoints.
  if (req.path.startsWith('/api')) {
    const available = [
      'GET /api/health',
      'POST /api/auth/signup',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET  /api/auth/me',
      'POST /api/contact',
    ];

    return res.status(404).json({
      success: false,
      message: 'Route not found.',
      available,
    });
  }

  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[unhandled error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

export default app;
