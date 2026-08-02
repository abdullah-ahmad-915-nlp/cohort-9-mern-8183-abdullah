import logger from '../config/logger.js';

function errorHandler(err, _, res, next) {
  logger.error({ err }, 'Unhandled error');

  let statusCode = err.statusCode;

  if (!Number.isInteger(statusCode) || statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  let message;
  if (process.env.NODE_ENV === 'production' && statusCode >= 500 && statusCode <= 599) {
    message = 'Internal server error';
  }
  else {
    message = err.message;
  }

  res.status(statusCode).json({ error: message });
}

export default errorHandler;