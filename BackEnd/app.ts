import express from 'express';
import { authRouter } from './routes/authRoutes.ts';
import { propertyRouter } from './routes/propertyRoutes.ts';
import { serviceRouter } from './routes/serviceRoutes.ts';
import { agencyRouter } from './routes/agencyRoutes.ts';
import { blogRouter } from './routes/blogRoutes.ts';
import { dashboardRouter } from './routes/dashboardRoutes.ts';
import { inquiryRouter } from './routes/inquiryRoutes.ts';
import { userRouter } from './routes/userRoutes.ts';
import { testMySQLConnection } from '../DataBase/mysql.ts';

export function createExpressApp() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
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
      database: isMySQLUp ? 'MySQL (Connected)' : 'Fallback Data Layer (Active)',
      mysqlConfigured: !!process.env.DB_HOST,
    });
  });

  // Mount API routers
  app.use('/api/auth', authRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/properties', propertyRouter);
  app.use('/api/services', serviceRouter);
  app.use('/api/agencies', agencyRouter);
  app.use('/api/blogs', blogRouter);
  app.use('/api', userRouter); // mounts /api/users and /api/profile
  app.use('/api/inquiries', inquiryRouter);
  app.use('/api/newsletter', inquiryRouter);

  return app;
}

export default createExpressApp;
