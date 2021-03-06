const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const { MONGODB_URI, PORT = 3000 } = process.env;
const { errors } = require('celebrate');
const cards = require('./routes/cards');
const users = require('./routes/users');
const { login, createUser } = require('./controllers/users');
const { validateUserLogin } = require('./middlewares/validations');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const auth = require('./middlewares/auth');

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(requestLogger);
app.use(limiter);
app.use(helmet());

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to DB'))
  .catch((err) => console.log(`DB connection error: ${err}`));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Server will crash now');
  }, 0);
});

app.use(cors());
app.options('*', cors());

app.use(express.json());
app.post('/signin', validateUserLogin, login);
app.post('/signup', validateUserLogin, createUser);

app.use(auth);

app.use('/', users);
app.use('/', cards);

app.use(errorLogger);

app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'An error occurred on the server'
        : message,
    });
});

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
