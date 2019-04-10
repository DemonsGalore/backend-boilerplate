module.exports = {
  secret: process.env.SECRET_OR_KEY,
  mongoURI: process.env.MONGO_URI,
  origin: process.env.ORIGIN,
  cookieSecret: process.env.COOKIE_SECRET,
  graphiql: false,
};
