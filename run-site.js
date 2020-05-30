const config                     = require('./test/functional/config');
const site                       = require('./test/functional/site');

site.create(config.site.ports, config.site.viewsPath);
