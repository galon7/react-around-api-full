const { StatusCodes } = require('http-status-codes');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(StatusCodes.OK).send({ data: users }))
    .catch((err) => {
      console.log(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'An error has occurred on the server' });
    });
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.id)
    .orFail(() => {
      const error = new Error('No user found with that id');
      error.statusCode = StatusCodes.NOT_FOUND;
      throw error;
    })
    .then((user) => {
      res.send({ data: user });
    }).catch((err) => {
      res.status(err.statusCode).send({ message: err.message });
    });
};

module.exports.getCurrentUser = (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      res.send(user);
    }).catch((err) => {
      res.status(err.statusCode).send({ message: err.message });
    });
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, about, avatar, email, password: hash,
      });
    })
    .then((user) => res.status(StatusCodes.CREATED).send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') res.status(StatusCodes.BAD_REQUEST).send({ message: 'Error, please check your data' });
      else res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: 'An error has occurred on the server' });
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'extreme-secret-key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => {
      res.status(StatusCodes.UNAUTHORIZED).send({ message: err.message });
    });
};

module.exports.updateProfile = (req, res) => {
  User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
    upsert: false,
  }).orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
      else if (err.name === 'DocumentNotFoundError') res.status(StatusCodes.NOT_FOUND).send({ message: err.message });
      else res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

module.exports.updateAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
    upsert: false,
  }).orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
      else if (err.name === 'DocumentNotFoundError') res.status(StatusCodes.NOT_FOUND).send({ message: err.message });
      else res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};
