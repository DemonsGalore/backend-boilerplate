const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const { secret, origin } = require('../../config/keys');

// load user model
const User = require('../../models/User');

// @route       GET api/auth/register
// @description register user
// @access      public
router.post('/register', async (req, res, next) => {
  // check if username is already taken
  const existingUsername = await User.findOne({ username: req.body.username.trim() });
  if (!existingUsername) {
    // if username is not registered proceed authentication
    passport.authenticate('register', (error, user, info) => {
      if (error) console.log(error);
      if (info !== undefined) {
        res.status(403).send({ message: info.message });
      } else {
        req.logIn(user, error => {
          // adapt to values on registration
          const { firstname, lastname, username } = req.body;
          const userData = {
            username: username.trim(),
            firstname: firstname.trim(),
            lastname: lastname.trim(),
          };
          User.findOneAndUpdate(
            { email: user.email },
            { $set: userData },
            { new: false }
          )
          .then(() => {
            res.status(200).send({ message: 'user created' });
          });
        });
      }
    })(req, res, next);
  } else {
    // check also email, if username is already taken for specified (error) message
    const existingEmail = await User.findOne({ email: req.body.email.trim() });
    if (existingEmail) {
      res.status(403).send({ message: 'Email and username are already taken.' });
    } else {
      res.status(403).send({ message: 'Username is already taken.' });
    }
  }
});

// TODO: async
// @route       GET api/auth/signin
// @description sign in user / returning JWT token
// @access      public
router.post('/login', (req, res, next) => {
  passport.authenticate('login', (error, user, info) => {
    if (error) console.log(error);
    if (info !== undefined) {
      res.status(403).send({ message: info.message });
    } else {
      req.logIn(user, error => {
        User.findOne({ email: user.email.trim() })
          .then(user => {
            const { _id, username, email, firstname, lastname, role } = user;
            const jwtPayload = {
              id: _id,
              username,
              email,
              firstname,
              lastname,
              role,
            };

            const jwtOptions = {
              expiresIn: '2w', // examples: 30s, 15m, 12h, 30d, 2w, 1y
            };

            jwt.sign(
              jwtPayload,
              secret,
              jwtOptions,
              (error, token) => {
                // TODO: check what is needed; only set one token (Bearer)
                res.status(200)
                  // .set({
                  //   'Access-Control-Allow-Origin': origin,
                  //   'Access-Control-Allow-Credentials': 'true'
                  // })
                  // TODO: expires needed? token has own expiration date/tim
                  // .cookie('Authorization', 'Bearer ' + token, {
                  //   expires: new Date(Date.now() + 1209600000),
                  //   httpOnly: true,
                  //   secure: false, // only send token over secured connection
                  //   // path: '/auth/token',
                  // })
                  .cookie('Authorization', token, {
                    expires: new Date(Date.now() + 1209600000),
                    httpOnly: true,
                    secure: false, // only send token over secured connection (SSL)
                    // path: '/auth/token', // possible to include path again?
                  })
                  .send({
                    auth: true,
                    token: 'Bearer ' + token, // TODO: remove token from response?
                    message: 'user found & logged in'
                  });
              }
            );
          });
      });
    }
  })(req, res, next);
});

// TODO: passport.authenticate jwt first? check if logged in at all
// @route       GET api/auth/signout
// @description sign out user / delete JWT token cookie on client
// @access      public
router.post('/logout', (req, res, next) => {
  res.status(200)
    // TODO: expires needed? token has own expiration date/time
    .cookie('Authorization', '', {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: false,
      // path: '/auth/token',
    })
    .send({
      auth: false,
      message: 'user signed out'
    });
});

// TODO: only for testing / DELETE
// @route       GET api/auth/users
// @description get all users with authentication
// @access      private
router.get('/users', (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user, info) => {
    if (error) console.log(error);
    if (info !== undefined) {
      res.send(info.message);
    } else {
      res.status(200).send({
        message: user.username + ' found in db'
      });
    }
  })(req, res, next);
});

module.exports = router;
