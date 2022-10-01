const config = require('../config');

const skipInProxyless = config.proxyless ? it.skip : it;

const skipInExperimentalDebug = config.experimentalDebug ? it.skip : it;

module.exports = {
    skipInProxyless,
    skipInExperimentalDebug,
};

