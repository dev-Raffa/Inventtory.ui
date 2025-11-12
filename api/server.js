const jsonServer = require('json-server');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');
const server = jsonServer.create();
const router = jsonServer.router(dbPath);

const middlewares = jsonServer.defaults({
  logger: false,
  static: '/tmp',
});

server.use(middlewares);

server.use(
  jsonServer.rewriter({
    '/api/*': '/$1',
  })
);

server.use(router);

module.exports = server;