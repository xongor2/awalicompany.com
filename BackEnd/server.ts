import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './app.ts';
import { assertDatabaseConfiguration, testMySQLConnection } from '../DataBase/mysql.ts';
import { initializeDatabase } from '../DataBase/repository.ts';

const app = createExpressApp();

const portArgIndex = process.argv.indexOf('--port');
const portFromArg = portArgIndex !== -1 ? parseInt(process.argv[portArgIndex + 1], 10) : NaN;
const PORT = !isNaN(portFromArg) ? portFromArg : 3000;

// ==========================================
// VITE MIDDLEWARE & SERVER BOOTSTRAP
// ==========================================

async function startServer() {
  assertDatabaseConfiguration();
  const connected = await testMySQLConnection();
  if (!connected) throw new Error('MySQL is required but could not be reached.');
  await initializeDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: path.join(process.cwd(), 'FrontEnd'),
      configFile: path.join(process.cwd(), 'FrontEnd', 'vite.config.ts'),
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'FrontEnd', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`AW Ali Company Server running on http://0.0.0.0:${PORT}`);
    console.log(`- Architecture: FrontEnd (React), BackEnd (Node.js/Express), DataBase (MySQL)`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${PORT} is in use; continuing...`);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();

export default app;
