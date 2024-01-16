const express = require("express");
const {
  getUsers,
  userLogin,
  registerUser,
  test,
} = require("../controllers/user");

const route = express.Router({ mergeParams: true });

route.get("/getAllUser", getUsers);
route.post("/login", userLogin);
route.post("/signup", registerUser);
route.post("/test", test);

module.exports = route;
