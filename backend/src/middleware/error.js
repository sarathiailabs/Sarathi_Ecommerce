export class AppError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.error(`[ERROR] [Req ID: ${req.requestId || 'N/A'}] ${err.stack}`);

  // Formulate FastAPI-like response: {"detail": "Error Message"}
  res.status(err.statusCode).json({
    detail: err.message,
    ...(process.env.NODE_ENV !== 'production' && err.details ? { details: err.details } : {})
  });
};
