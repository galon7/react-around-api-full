const { StatusCodes } = require('http-status-codes');
const { ErrorHandler } = require('../middlewares/errors');

const Card = require('../models/card');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      if (!cards) {
        throw new Error();
      }
      res.status(StatusCodes.OK).send(cards);
    })
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  Card.create({ name, link, owner })
    .then((card) => {
      if (!card) {
        throw new ErrorHandler(StatusCodes.BAD_REQUEST, 'Error, please check your data');
      }
      res.status(StatusCodes.CREATED).send({ data: card });
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.find({ _id: req.params.cardId })
    .then((cardFound) => {
      if (!cardFound) {
        throw new ErrorHandler(StatusCodes.NOT_FOUND, 'Error, card not found');
      }
      const cardFoundOwner = cardFound[0].owner.valueOf();
      if (cardFoundOwner === req.user._id) {
        Card.findByIdAndRemove(req.params.cardId)
          .then((card) => {
            if (!card) {
              throw new ErrorHandler(StatusCodes.NOT_FOUND, 'Error, card not found');
            }
            res.status(StatusCodes.OK).send({ data: card });
          })
          .catch((err) => {
            if (err.name === 'CastError') {
              throw new ErrorHandler(StatusCodes.BAD_REQUEST, 'Error, bad request');
            }
            next(err);
          })
          .catch(next);
      } else {
        throw new ErrorHandler(StatusCodes.UNAUTHORIZED, 'Authorization required');
      }
    }).catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  ).then((card) => {
    if (!card) {
      throw new ErrorHandler(StatusCodes.NOT_FOUND, 'Error, card not found');
    }
    res.status(StatusCodes.OK).send({ data: card });
  }).catch((err) => {
    if (err.name === 'CastError') {
      throw new ErrorHandler(StatusCodes.BAD_REQUEST, 'Error, bad request');
    }
    next(err);
  })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  ).then((card) => {
    if (!card) {
      throw new ErrorHandler(StatusCodes.NOT_FOUND, 'Error, card not found');
    }
    res.status(StatusCodes.OK).send({ data: card });
  }).catch((err) => {
    if (err.name === 'CastError') {
      throw new ErrorHandler(StatusCodes.BAD_REQUEST, 'Error, bad request');
    }
    next(err);
  })
    .catch(next);
};
