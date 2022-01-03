const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { ErrorHandler } = require('./errors');

const { NODE_ENV, JWT_SECRET } = process.env;

// eslint-disable-next-line
module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const err = new ErrorHandler(StatusCodes.UNAUTHORIZED, 'Authorization required');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(err);
    return;
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (e) {
    next(err);
  }

  req.user = payload;

  next();
};
