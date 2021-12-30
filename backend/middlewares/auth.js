const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: 'Authorization Required1' });
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'extreme-secret-key');
  } catch (err) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ message: 'Authorization Required2' });
  }

  req.user = payload;

  next();
};
