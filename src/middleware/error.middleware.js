const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Safe error handling - never expose internal details in production
  const isProduction = process.env.NODE_ENV === 'production';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((val) => val.message);
    message = 'Validation failed';
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size is 10MB';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded';
    } else {
      message = 'File upload failed';
    }
  }

  // Log full error details server-side for debugging
  console.error('Error:', {
    message: err.message,
    stack: isProduction ? 'Hidden in production' : err.stack,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message,
    // Only expose stack trace in development
    ...(isProduction 
      ? { error: 'Internal Server Error' } 
      : { stack: err.stack, error: err.message }),
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
