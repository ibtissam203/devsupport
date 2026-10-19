import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Erreur serveur';

  if (env.NODE_ENV !== 'production') {
    console.error('💥', err);
  }

  res.status(status).json({
    message,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}