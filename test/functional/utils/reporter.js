const { noop } = require('lodash');

module.exports.createReporter = (reporterInit) => {
    return () => Object.assign({
        reportTaskStart:    noop,
        reportTestDone:     noop,
        reportFixtureStart: noop,
        reportTaskDone:     noop
    }, reporterInit);
};
