const { once } = require('events');

module.exports = stream => once(stream, 'end');
