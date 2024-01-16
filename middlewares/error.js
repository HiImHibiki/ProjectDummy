const ErrorResponse = require("../utils/errorResponse");
const { validationResult } = require("express-validator");

const errorHandler = (err, req, res, next) => {
  let error = { ...err }; // Spread Operator

  error.message = err.message;

  // Log to console for dev
  console.log(err);

  if (err.name === "CastError") {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 404);
  }

  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Not authorized";
    error = new ErrorResponse(message, 401);
  }
  if (!res.headersSent) {
    res.status(error.statusCode || 500).json({
      status: error.statusCode || 500,
      success: false,
      error: error.message || "Server Error",
    });
  }
};

module.exports = errorHandler;

module.exports.validation_error = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    next();
  } else {
    res.status(400).json({
      status: 400,
      success: false,
      message: "Errors",
      data: errors.array(),
    });
  }
};
