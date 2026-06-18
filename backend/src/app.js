import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import settings from './config/settings.js';
import trackingMiddleware from './middleware/tracking.js';
import { errorHandler } from './middleware/error.js';
import { seedData } from './utils/seed.js';

// Import Routers
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
import shopsRouter from './routes/shops.js';
import deliveryRouter from './routes/delivery.js';
import reviewsRouter from './routes/reviews.js';
import wishlistRouter from './routes/wishlist.js';
import couponsRouter from './routes/coupons.js';
import returnsRouter from './routes/returns.js';
import adminRouter from './routes/admin.js';
import healthRouter from './routes/health.js';
import testRouter from './routes/testUtils.js';

const app = express();

// ── Outermost Middlewares (Order matches Python exactly) ───────────────────
app.use(trackingMiddleware); // Ingress Request ID and Response Timing

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['*'],
  allowedHeaders: ['*']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Root Health Route ──────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', version: '3.0.0' });
});

// ── Mount Health Check Router (Root level) ──────────────────────────────────
app.use('/health', healthRouter);

// ── Mount Prefixed API Routers ──────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/shops', shopsRouter);
app.use('/api/deliveries', deliveryRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/returns', returnsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/test', testRouter);

// ── Serve Frontend Static Files (Option A) ──────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../../frontend/dist');

// Serve the static assets folder
app.use(express.static(distPath));

// Fallback to React's index.html for all non-API paths (client-side routing)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Centralized Error Handler ──────────────────────────────────────────────
app.use(errorHandler);

// ── Server Start & Startup Lifespan Operations ─────────────────────────────
const PORT = settings.PORT;
app.listen(PORT, async () => {
  console.log(`[SERVER] NovaCart Backend running in ${settings.ENVIRONMENT} mode on port ${PORT}`);
  
  // Lifespan startup seeding (run unless environment is production or keys are placeholders)
  if (settings.ENVIRONMENT !== 'production' && 
      settings.SUPABASE_URL && 
      !settings.SUPABASE_URL.includes('placeholder')) {
    try {
      console.log('[LIFESPAN] Running startup database seeding...');
      await seedData();
      console.log('[LIFESPAN] Seeding completed.');
    } catch (e) {
      console.error('[LIFESPAN] Database seeding error on startup:', e.message);
    }
  }
});

export default app;
