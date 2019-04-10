const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema
} = require('graphql');

const User = require('../../models/User');

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    firstname: { type: GraphQLString },
    lastname: { type: GraphQLString },
    role: { type: GraphQLString },
    // INFO: never add password here!
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {}
});

const RootMutation = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: {}
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
