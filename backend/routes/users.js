const router = require('express').Router();

const { validateParam, validateUser, validateAvatar } = require('../middlewares/validations');

const {
  getUsers, getUser, updateProfile, updateAvatar, getCurrentUser,
} = require('../controllers/users');

router.get('/users', getUsers);

router.get('/users/me', getCurrentUser);

router.get('/users/:id', validateParam, getUser);

router.patch('/users/me', validateUser, updateProfile);

router.patch('/users/me/avatar', validateAvatar, updateAvatar);

module.exports = router;
