const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const path = require("path");
const User = require("./models/userModel");
const routes = require("./routes/route.js");

require("dotenv").config({
  path: path.join(__dirname, "../.env")
});

const app = express();

const PORT = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost:27017/rbac", { useNewUrlParser: true }).then(() => {
  console.log("Connected to the Database successfully");
});
// extended: false specifies that the parsing result object will represent a set of key-value pairs, and each value can be represented as a string or array.
app.use(bodyParser.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) { // the headers object will come from the client, in which the user token is written
    const accessToken = req.headers["x-access-token"];
    const { userId, exp } = await jwt.verify(
      accessToken,
      process.env.JWT_SECRET
    );
    // Check if token has expired
    if (exp < Date.now().valueOf() / 1000) {
      return res
        .status(401)
        .json({
          error: "JWT token has expired, please login to obtain a new one"
        });
    }
    // write to a variable that is available everywhere in the application
    res.locals.loggedInUser = await User.findById(userId);
    next();
  } else {
    next();
  }
});

app.use("/", routes);

app.listen(PORT, () => {
  console.log("Server is listening on Port:", PORT);
});
