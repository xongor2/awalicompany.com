import express from 'express';
import { authRouter } from './routes/authRoutes.ts';
import { propertyRouter } from './routes/propertyRoutes.ts';
import { serviceRouter } from './routes/serviceRoutes.ts';
import { agencyRouter } from './routes/agencyRoutes.ts';
import { blogRouter } from './routes/blogRoutes.ts';
import { dashboardRouter } from './routes/dashboardRoutes.ts';
import { inquiryRouter } from './routes/inquiryRoutes.ts';
import { userRouter } from './routes/userRoutes.ts';
import { roleRouter } from './routes/roleRoutes.ts';
import { propertyLocationRouter } from './routes/propertyLocationRoutes.ts';
import { educationRouter } from './routes/educationRoutes.ts';
import { healthSpecialtyRouter } from './routes/healthSpecialtyRoutes.ts';
import { testMySQLConnection } from '../DataBase/mysql.ts';

export function createExpressApp() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // CORS headers
  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;
    const configuredOrigins = (process.env.CORS_ORIGIN || process.env.APP_URL || '')
      .split(',').map(value => value.trim()).filter(Boolean);
    let sameOrigin = false;
    if (requestOrigin) {
      try { sameOrigin = new URL(requestOrigin).host === req.get('host'); } catch { sameOrigin = false; }
    }
    if (requestOrigin && (sameOrigin || configuredOrigins.includes(requestOrigin))) {
      res.header('Access-Control-Allow-Origin', requestOrigin);
      res.header('Vary', 'Origin');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health and database diagnostics endpoint
  app.get('/api/health', async (req, res) => {
    const isMySQLUp = await testMySQLConnection();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      backend: 'Node.js Express',
      database: isMySQLUp ? 'MySQL (Connected)' : 'MySQL (Unavailable)',
      mysqlConfigured: !!process.env.DB_HOST,
    });
  });

  // Mount API routers
  app.use('/api/auth', authRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/properties', propertyRouter);
  app.use('/api/property-locations', propertyLocationRouter);
  app.use('/api/services', serviceRouter);
  app.use('/api/education', educationRouter);
  app.use('/api/health-specialties', healthSpecialtyRouter);
  app.use('/api/agencies', agencyRouter);
  app.use('/api/blogs', blogRouter);
  app.use('/api', userRouter); // mounts /api/users and /api/profile
  app.use('/api/roles', roleRouter);
  app.use('/api/inquiries', inquiryRouter);
  app.use('/api/newsletter', inquiryRouter);

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[API]', err);
    res.status(500).json({ error: 'The server could not complete this request.' });
  });

  return app;
}

export default createExpressApp;
