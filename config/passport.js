const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { secret } = require('../config/keys');

// TODO: extend to email- and username-check on register/login
// TODO: login and jwt to async

// INFO: always use usernameField for strategy!!! emailField ist not working!!!

passport.use(
  'register',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async (email, password, done) => {
      try {
        const existingUser = await User.findOne({ email: email.trim() });
        if (existingUser) {
          return done(null, false, { message: 'Email is already registered.' });
        } else {
          const hashedPassword = await bcrypt.hash(password, 12);
          const newUser = new User({
            email: email.trim(),
            password: hashedPassword,
          });
          const user = await newUser.save();
          return done(null, user)
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.trim() });
        if (!user) {
          return done(null, false, { message: 'Email is not registered.' });
        } else {
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
            // TODO: remove password from user before sending back (needed?)
            return done(null, user)
          } else {
            return done(null, false, { message: 'Wrong password.' });
          }
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

// TODO: temporary(?) solution
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['Authorization'];
  }
  return token;
};

// TODO: use fromAuthHeaderAsBearerToken; only working on localStorage for now :(
const options = {
  // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  jwtFromRequest: cookieExtractor,
  secretOrKey: secret,
};

passport.use(
  'jwt',
  new JWTStrategy(options, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        done(null, user);
      } else {
        // TODO: does this ever get called?
        console.log("FML");
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
