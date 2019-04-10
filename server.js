const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const cors = require('cors');

const schema = require('./graphql/schema/schema');
const { mongoURI, graphiql } = require('./config/keys');

const app = express();

// allow cross-origin
app.use(cors());

// graphQL initialization
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql
}));

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
