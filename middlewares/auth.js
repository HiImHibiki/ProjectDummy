const jwt = require("jsonwebtoken");
const asyncFunc = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models").User;

exports.protect = asyncFunc(async (req, res, next) => {
  let token;

  // Set token from bearer token in header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // Set token from cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  req.user = await User.findByPk(decoded.id);
  if (!req.user) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
  next();
});

exports.adminAuth = asyncFunc(async (req, res, next) => {
  console.log(req.user.username);
  if (!req.user.admin) {
    return next(
      new ErrorResponse(`Unauthorized to access this route`, 403) // Forbidden error
    );
  }
  next();
});
