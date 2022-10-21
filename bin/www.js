const app = require('../servers');

/**
 * Get port from environment and store in Express.
 */
// const port = normalizePort(process.env.PORT || '3000');
const port = 3000;
app.set('port', port);

/**
 * Create HTTP server.
 */
app.listen(port)