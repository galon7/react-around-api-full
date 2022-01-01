const router = require('express').Router();

const { validateParam, validateCard } = require('../middlewares/validations');

const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

router.get('/cards', getCards);

router.post('/cards', validateCard, createCard);

router.delete('/cards/:cardId', validateParam, deleteCard);

router.put('/cards/:cardId/likes', validateParam, likeCard);

router.delete('/cards/:cardId/likes', validateParam, dislikeCard);

module.exports = router;
