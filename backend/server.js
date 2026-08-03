import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import logger from './src/config/logger.js';
import connectDB from './src/config/db.js';
import requestLogger from './src/middleware/requestLogger.js';
import routes from './src/routes/index.js';
import notFound from './src/middleware/notFound.js';
import errorHandler from './src/middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

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
      process.exitCode = 1;
    });
  } catch (err) {
    logger.error({ err }, 'Startup failed');
    process.exitCode = 1;
  }
}

start();