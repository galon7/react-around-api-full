const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { ErrorHandler } = require('./errors');

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
    payload = jwt.verify(token, 'extreme-secret-key');
  } catch (e) {
    next(err);
  }

  req.user = payload;

  next();
};
