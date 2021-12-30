const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { PORT = 3000 } = process.env;
const cards = require('./routes/cards');
const users = require('./routes/users');
const { login, createUser } = require('./controllers/users');
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

app.use(express.json());
app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);

app.use('/', users);
app.use('/', cards);

const checker = (req, res) => {
  res.status(404).send('Requested resource not found');
};

app.use(checker);

app.listen(PORT, () => {
  console.log(`App listening at port ${PORT}`);
});
