export const sendSuccess = (res, statusCode, data, message = 'Success') => {
  const payload = {
    success: true,
    status: 'success',
    message,
    data,
  };

  if (res.locals?.requestId) {
    payload.requestId = res.locals.requestId;
  }

  res.status(statusCode).json(payload);
};

export const sendPaginated = (res, statusCode, data, pagination, message = 'Success') => {
  const payload = {
    success: true,
    status: 'success',
    message,
    data,
    pagination,
  };

  if (res.locals?.requestId) {
    payload.requestId = res.locals.requestId;
  }

  res.status(statusCode).json(payload);
};

export const sendError = (
  res,
  {
    statusCode = 500,
    code = 'SERVER_ERROR',
    message = 'Something went wrong',
    errors = [],
    requestId = null,
  }
) => {
  res.status(statusCode).json({
    success: false,
    statusCode,
    code,
    message,
    requestId: requestId || res.locals?.requestId || null,
    errors: Array.isArray(errors) ? errors : [],
    timestamp: new Date().toISOString(),
  });
};
