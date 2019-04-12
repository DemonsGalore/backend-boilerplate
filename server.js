const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const auth = require('./routes/api/auth');
const schema = require('./graphql/schema/schema');
const { mongoURI, graphiql, cookieSecret, origin } = require('./config/keys');
// passport config
require('./config/passport');

const app = express();

// allow cross-origin
app.use(cors({
  origin,
  credentials: true
}));

// express body-parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// passport middleware
app.use(passport.initialize());

// cookie parser middleware
app.use(cookieParser(cookieSecret));

// graphQL initialization
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql
}));

// routes
app.use('/api/auth', auth);

// connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('MongoDB connected.');
    // start server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}.`));
  })
.catch(error => console.log("Error", error));
