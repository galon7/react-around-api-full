const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { ErrorHandler } = require('../middlewares/errors');

const { NODE_ENV, JWT_SECRET } = process.env;
const User = require('../models/user');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      if (!users) {
        throw new Error();
      }
      res.status(StatusCodes.OK).send(users);
    })
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (!user) {
        throw new ErrorHandler(StatusCodes.NOT_FOUND, 'No user found with that id');
      }
      res.send(user);
    }).catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new Error();
      }
      res.send(user);
    }).catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      if (!user) {
        throw new ErrorHandler(StatusCodes.BAD_REQUEST, 'Error, please check your data');
      }
      User.findOne(user).then((userSafe) => res.status(StatusCodes.CREATED).send(userSafe));
    }).catch((err) => {
      if (err.code === 11000) throw new ErrorHandler(StatusCodes.CONFLICT, 'Error, please check your data');
      else next(err);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new ErrorHandler(StatusCodes.UNAUTHORIZED, 'Error, please check your data');
      }
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};

module.exports.updateProfile = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
    upsert: false,
  }).then((user) => {
    if (!user) {
      throw new ErrorHandler(StatusCodes.NOT_FOUND, 'Error, user not found');
    }
    res.send(user);
  }).catch((err) => {
    if (err.name === 'CastError') {
      throw new ErrorHandler(StatusCodes.BAD_REQUEST, 'Error, bad request');
    }
    next(err);
  })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
    upsert: false,
  }).then((user) => {
    if (!user) {
      throw new ErrorHandler(StatusCodes.NOT_FOUND, 'Error, user not found');
    }
    res.send(user);
  }).catch((err) => {
    if (err.name === 'CastError') {
      throw new ErrorHandler(StatusCodes.BAD_REQUEST, 'Error, bad request');
    }
    next(err);
  })
    .catch(next);
};
