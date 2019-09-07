const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { roles } = require("../roles");

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.signup = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || "basic"
    });
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );
    // example accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDczNzc4NWVmMjkxZjI4Y2NjNTdhZTciLCJpYXQiOjE1Njc4NDgzMjUsImV4cCI6MTU2NzkzNDcyNX0.au_dpRVL5GJZhWBrzwhFqWpfq9gWLdLJjLN-4B0p9NE"
    newUser.accessToken = accessToken; 
    await newUser.save();
    res.json({
      data: newUser,
      message: 'You have signed up successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new Error("Email does not exist"));
    const validPassword = await validatePassword(password, user.password);
    if (!validPassword) return next(new Error("Password is not correct"));
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    }); // update token каждый раз когда логинимся
    await User.findByIdAndUpdate(user._id, { accessToken });
    res.status(200).json({
      data: { email: user.email, role: user.role },
      accessToken // sends a token to the user so that he can have access to restricted routes
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    data: users
  });
};

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) return next(new Error("User does not exist"));
    res.status(200).json({
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const update = req.body;
    const userId = req.params.userId;
    await User.findByIdAndUpdate(userId, update);
    const user = await User.findById(userId);
    res.status(200).json({
      data: user,
      message: "User has been updated"
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    await User.findByIdAndDelete(userId);
    res.status(200).json({
      data: null,
      message: "User has been deleted"
    });
  } catch (error) {
    next(error);
  }
};

exports.grantAccess = function(action, resource) {
  return async (req, res, next) => {
    try {
      // action will be a value such as readAny, deleteAny, etc..
      // resource represents what resource the defined action has permission to operate on e.g profile
      // The roles.can(userRole)[action](resource) method determines if the user’s role has sufficient permission to perform the specified action of the provided resource
      const permission = roles.can(req.user.role)[action](resource); // for example, roles.can('basic')['readAny']('profile') - false
      if (!permission.granted) {
        return res.status(401).json({
          error: "You don't have enough permission to perform this action"
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

exports.allowIfLoggedin = async (req, res, next) => {
  try {
    const user = res.locals.loggedInUser; // an object from the database that is written to middleware in the server.js
    if (!user)
      return res.status(401).json({
        error: "You need to be logged in to access this route"
      });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
