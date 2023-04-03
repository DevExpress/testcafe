const config = require('../config');

const skipInNativeAutomation  = config.nativeAutomation ? it.skip : it;
const skipInExperimentalDebug                   = config.experimentalDebug ? it.skip : it;
const skipInNativeAutomationOrExperimentalDebug = config.nativeAutomation || config.experimentalDebug ? it.skip : it;
const skipDescribeInNativeAutomation            = config.nativeAutomation ? describe.skip : describe;
const onlyInNativeAutomation                    = config.nativeAutomation ? it : it.skip;

module.exports = {
    skipInNativeAutomation,
    skipInExperimentalDebug,
    skipDescribeInNativeAutomation,
    skipInNativeAutomationOrExperimentalDebug,
    onlyInNativeAutomation,
};

