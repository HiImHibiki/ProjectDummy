const express = require("express");
const dotenv = require("dotenv");
const config = require("config");
const morgan = require("morgan");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/error");

const app = express();
const server_conf = config.get("server");

// Route files
const user = require("./routes/user");

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Route files
app.get("/", (req, res) => {
  res.status(200).json({
    test: "success",
  });
});
app.use(`${server_conf.api.basepath}user`, user);

app.use(errorHandler);

const server = app.listen(
  server_conf.port,
  console.log(
    `Server is running in ${server_conf.env} mode on port ${server_conf.port}`
      .yellow.bold
  )
);

// Handle unhandled promise rejection
process.on("uncaughtException", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
