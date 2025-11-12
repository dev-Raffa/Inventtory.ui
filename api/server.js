import { create, router as _router, defaults, rewriter } from 'json-server';
import { join } from 'path';

const dbPath = join(__dirname, 'db.json');
const server = create();
const router = _router(dbPath);

const middlewares = defaults({
  logger: false,
  static: '/tmp',
});

server.use(middlewares);

server.use(
  rewriter({
    '/api/*': '/$1',
  })
);

server.use(router);

export default server;