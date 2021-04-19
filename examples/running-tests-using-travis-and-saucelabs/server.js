const connect     = require('connect');
const serveStatic = require('serve-static');

connect().use(serveStatic(__dirname)).listen(9090, () => {
    process.stdout.write('Server running on 9090...\n');
});
