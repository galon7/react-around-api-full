const { StatusCodes } = require('http-status-codes');

const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(StatusCodes.OK).send({ data: cards }))
    .catch((err) => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

module.exports.createCard = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.status(StatusCodes.CREATED).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') res.status(StatusCodes.BAD_REQUEST).send({ message: 'Error, please check your data' });
      else res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail()
    .then((card) => {
      res.status(StatusCodes.OK).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
      else if (err.name === 'DocumentNotFoundError') res.status(StatusCodes.NOT_FOUND).send({ message: err.message });
      else res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  ).orFail()
    .then((card) => {
      res.status(StatusCodes.OK).send({ data: card });
    }).catch((err) => {
      if (err.name === 'CastError') res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
      else if (err.name === 'DocumentNotFoundError') res.status(StatusCodes.NOT_FOUND).send({ message: err.message });
      else res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  ).orFail()
    .then((card) => {
      res.status(StatusCodes.OK).send({ data: card });
    }).catch((err) => {
      if (err.name === 'CastError') res.status(StatusCodes.BAD_REQUEST).send({ message: err.message });
      else if (err.name === 'DocumentNotFoundError') res.status(StatusCodes.NOT_FOUND).send({ message: err.message });
      else res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: err.message });
    });
};
