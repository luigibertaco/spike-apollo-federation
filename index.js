// index.js
const { ApolloServer } = require('apollo-server');
const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'profile-service', url: 'http://localhost:8000/graphql/' },
    { name: 'billing-service', url: 'http://localhost:8001/graphql/' },
  ],
  // ApolloGateway will not automatically forward the headers from the request
  // to the federated service, we need to inject the required headers into the
  // request object
  buildService({ name, url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        request.http.headers.set("Authorization", context?.headers?.authorization);
      }
    });
  }
});

const server = new ApolloServer({
    gateway,
    subscriptions: false,
    // To make the original request headers available to the internal request
    // to the federated service, we must inject it into the context object
    context: ({req}) => {
        return { headers: req.headers }
    },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
