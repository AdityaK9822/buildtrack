const ErrorResponse = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const paginate = (model, query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    limit: parseInt(limit),
  };
};

// Create sanitized error response for clients
const createErrorResponse = (message, statusCode = 500, includeDetails = false) => {
  const error = {
    success: false,
    message,
    status: statusCode,
  };
  
  if (includeDetails) {
    error.details = process.env.NODE_ENV === 'development' ? { message } : undefined;
  }
  
  return error;
};

module.exports = {
  ErrorResponse,
  asyncHandler,
  paginate,
  createErrorResponse,
};
