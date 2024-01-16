const db = require("../models");
const User = require("../models").User;
const Op = db.Sequelize.Op;

const jwt = require("jsonwebtoken");

const ErrorResponse = require("../utils/errorResponse");
const { getPagination, getPagingData } = require("../utils/pagination");
const asyncFunc = require("../middlewares/async");

/**
 * @desc    Get list of user
 * @route   GET /user
 */
exports.getUsers = asyncFunc(async (req, res, next) => {
  const { page, size, username, id } = req.query;

  if (size < 0 || size > 10000) {
    return next(new ErrorResponse(`Limit can only be between 0-10000`, 400));
  }
  if (page < 0 || page > 10000) {
    return next(new ErrorResponse(`Page can only be between 0-10000`, 400));
  }

  let condition = {};
  if (username) {
    condition.username = { [Op.like]: `%${username}%` };
  }
  if (id) {
    condition.id = id;
  }

  const { limit, offset } = getPagination(page, size);

  const users = await User.findAndCountAll({
    where: condition,
    limit: limit,
    offset: offset,
    distinct: true,
    order: [["createdAt", "DESC"]],
  });

  const response = getPagingData(users, page, limit);

  res.status(200).json({
    success: true,
    data: response,
  });
});

/**
 * @desc    User Register
 * @route   POST /user/register
 */
exports.registerUser = asyncFunc(async (req, res, next) => {
  const { username, password } = req.body;

  const userExist = await User.findOne({ where: { username: username } });
  if (userExist) {
    return next(
      new ErrorResponse(`User with that username already exist`, 400)
    );
  }

  const user = await User.create({
    username,
    password,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @desc    User Login
 * @route   POST /user/auth/login
 */
exports.userLogin = asyncFunc(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({
    where: { username: username, password: password },
  });

  if (!user) {
    return next(new ErrorResponse(`Invalid Credentials`, 400));
  }

  const token = generateToken(user.id);
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (user) {
    res.status(200).cookie("token", token, options).json({
      success: true,
      id: user.id,
      name: user.name,
      token: token,
    });
  } else {
    return next(new ErrorResponse(`Invalid Credentials`, 400));
  }
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

/**

 */
exports.test = asyncFunc(async (req, res, next) => {
  const { text } = req.body;

  res.status(200).json({
    text: text,
  });
});
