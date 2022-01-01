const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error('string.uri');
};

const validateEmail = (value, helpers) => {
  if (validator.isEmail(value)) {
    return value;
  }
  return helpers.error('string.uri');
};

const validateCard = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom(validateURL),
  }),
});

const validateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom(validateURL),
    email: Joi.string().required().min(3).custom(validateEmail),
    password: Joi.string().required().min(8),
  }).unknown(true),
});

const validateParam = celebrate({
  params: Joi.object().keys({
    id: Joi.string().alphanum().length(24),
    cardId: Joi.string().alphanum().length(24),
  }).unknown(true),
});

module.exports = { validateCard, validateUser, validateParam };
