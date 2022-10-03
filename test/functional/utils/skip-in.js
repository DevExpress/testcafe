const config = require('../config');

const skipInProxyless         = config.proxyless ? it.skip : it;
const skipInExperimentalDebug = config.experimentalDebug ? it.skip : it;
const skipDescribeInProxyless = config.proxyless ? describe.skip : describe;

module.exports = {
    skipInProxyless,
    skipInExperimentalDebug,
    skipDescribeInProxyless,
};

