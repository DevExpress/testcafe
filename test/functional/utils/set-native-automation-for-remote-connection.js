module.exports = function setNativeAutomationForRemoteConnection (runner) {
    // Hack: it's necessary to run remote browsers in the native automation mode.
    runner.bootstrapper._calculateIsNativeAutomation = function () {
        this.nativeAutomation = true;
    };
};
