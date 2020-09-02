/* eslint-disable no-console */
const logger = require('./logger');
const app = require('./app');
const port = app.get('port');
const server = app.listen(port);

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason)
);
const nodeEnv = process.env.NODE_ENV || 'default'
server.on('listening', () => {
  logger.info('Feathers application started on http://%s:%d', app.get('host'), port);
  logger.info(`Application Env ${nodeEnv}`);
}
);
