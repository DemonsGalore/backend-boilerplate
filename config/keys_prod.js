module.exports = {
  secret: process.env.SECRET_OR_KEY,
  mongoURI: process.env.MONGO_URI,
  origin: process.env.ORIGIN, // http://localhost:3000 in development
  cookieSecret: process.env.COOKIE_SECRET,
  graphiql: false,
};
