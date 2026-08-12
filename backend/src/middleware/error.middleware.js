const { Prisma } = require("@prisma/client");
const { ZodError } = require("zod");

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let code = err.code || "INTERNAL_SERVER_ERROR";
  let message = err.message || "An unexpected error occurred";
  let errors = err.errors || [];

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    code = "INVALID_INPUT";
    message = "Validation failed for input parameters";
    errors = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }
  // Handle Prisma Known Database Errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      code = "DUPLICATE_ENTRY";
      message = "A record with this value already exists";
    } else if (err.code === "P2025") {
      statusCode = 404;
      code = "NOT_FOUND";
      message = "Requested database record was not found";
    } else {
      statusCode = 400;
      code = `PRISMA_${err.code}`;
      message = "Database operation constraint error";
    }
  }
  // Handle Multer upload errors
  else if (err.name === "MulterError") {
    statusCode = 400;
    code = `MULTER_${err.code}`;
    message = err.message;
  }

  // Log 500 errors internally
  if (statusCode === 500) {
    console.error(`[UnhandledError] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    code,
    message,
    ...(errors.length > 0 && { errors }),
  });
}

module.exports = errorHandler;