const config = require('../config');

const skipInProxyless                    = config.proxyless ? it.skip : it;
const skipInExperimentalDebug            = config.experimentalDebug ? it.skip : it;
const skipInProxylessOrExperimentalDebug = config.proxyless || config.experimentalDebug ? it.skip : it;
const skipDescribeInProxyless            = config.proxyless ? describe.skip : describe;
const onlyInProxyless                    = config.proxyless ? it : it.skip;

module.exports = {
    skipInProxyless,
    skipInExperimentalDebug,
    skipDescribeInProxyless,
    skipInProxylessOrExperimentalDebug,
    onlyInProxyless,
};

