const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const { PORT = 3000 } = process.env;
const { errors } = require('celebrate');
const cards = require('./routes/cards');
const users = require('./routes/users');
const { login, createUser } = require('./controllers/users');
const { validateUser } = require('./middlewares/validations');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const auth = require('./middlewares/auth');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(helmet());

mongoose
  .connect('mongodb://localhost:27017/aroundb')
  .then(console.log('Connected to DB'))
  .catch((err) => console.log(`DB connection error: ${err}`));

const allowedOrigins = [
  'https://galon.students.nomoreparties.sbs',
  'http://galon.students.nomoreparties.sbs',
  'http://localhost:3001',
];
app.use(cors({ origin: allowedOrigins }));
app.options('*', cors());

app.use(requestLogger);

app.use(express.json());
app.post('/signin', validateUser, login);
app.post('/signup', validateUser, createUser);

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
