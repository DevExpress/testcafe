const { noop } = require('lodash');

module.exports = function setNativeAutomationForRemoteConnection (runner) {
    // Hack: it's necessary to run remote browsers in the native automation mode.
    runner.bootstrapper._disableNativeAutomationIfNecessary = noop;
};
