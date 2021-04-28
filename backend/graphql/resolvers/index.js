const authResolver = require('./auth');
const eventsResolver = require('./images');

const rootResolver = {
  ...authResolver,
  ...eventsResolver,
};

module.exports = rootResolver;