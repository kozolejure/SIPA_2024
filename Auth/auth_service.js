const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Povezava z MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin@localhost:27017/users?authSource=admin';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Definiranje sheme in modela uporabnika
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});
const User = mongoose.model('User', userSchema);

// Nastavitev Passport lokalne strategije
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Inicializacija Express aplikacije
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());

// Swagger konfiguracija
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth API',
      version: '1.0.0',
      description: 'API za avtentikacijo uporabnikov',
      contact: {
        name: 'Tvoje Ime',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./auth_service.js'], // pot do tvojih API dokumentacijskih komentarjev
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Ustvari novega uporabnika
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Uporabnik uspešno ustvarjen
 *       500:
 *         description: Napaka strežnika
 */
app.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Prijava uporabnika in izdaja JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prijava uspešna
 *       400:
 *         description: Napačno uporabniško ime ali geslo
 */
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : 'Login failed',
        user: user
      });
    }

    // Uporabnik uspešno preverjen, izdaja JWT
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }

      // Podatki, ki bodo vključeni v JWT
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email
      };

      // Tajni ključ za podpis JWT
      const secret = 'skrivnost';
      // Ustvarite Access Token
      const token = jwt.sign(payload, secret, { expiresIn: '15m' });
      // Ustvarite Refresh Token
      const refreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });

      return res.json({ user: payload, token, refreshToken });
    });
  })(req, res, next);
});

/**
 * @swagger
 * /token:
 *   post:
 *     summary: Osveži access token z uporabo refresh tokena
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token uspešno osvežen
 *       401:
 *         description: Neveljaven ali potekel refresh token
 */
app.post('/token', (req, res) => {
  const { refreshToken } = req.body;
  const secret = 'skrivnost';

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  jwt.verify(refreshToken, secret, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    const newAccessToken = jwt.sign(payload, secret, { expiresIn: '40m' });
    const newRefreshToken = jwt.sign(payload, secret, { expiresIn: '7d' });

    return res.json({ token: newAccessToken, refreshToken: newRefreshToken });
  });
});

// Določitev porta in zagon strežnika
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
