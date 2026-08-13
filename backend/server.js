import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import logger from './src/config/logger.js';
import connectDB from './src/config/db.js';
import { doubleCsrfProtection } from './src/config/csrf.js';
import requestLogger from './src/middleware/requestLogger.js';
import routes from './src/routes/index.js';
import notFound from './src/middleware/notFound.js';
import errorHandler from './src/middleware/errorHandler.js';

if (!process.env.CSRF_SECRET) {
  logger.error('CSRF_SECRET is not set. Add it to your .env file before starting the server.');
  process.exit(1);
}

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(doubleCsrfProtection);
app.use(requestLogger);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await connectDB();

    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });

    server.on('error', (err) => {
      logger.error({ err }, 'Server failed to start');
      process.exit(1);
    });
  } catch (err) {
    logger.error({ err }, 'Startup failed');
    process.exit(1);
  }
}

start();