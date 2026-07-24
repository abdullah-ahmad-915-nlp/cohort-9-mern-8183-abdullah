require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');

const logger = require('./src/config/logger');
const connectDB = require('./src/config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

async function start() {
  await connectDB();

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
  });
}

start();