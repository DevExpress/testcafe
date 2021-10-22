const { createReporter } = require('./reporter');
const { expect }         = require('chai');

module.exports.createWarningReporter = () => {
    const warningResult = {
        warnings:        [],
        actionStartList: {},
        actionDoneList:  {},
    };

    const reporter = createReporter({
        reportWarnings: warning => {
            warningResult.warnings.push(warning);
        },
        reportTestActionStart: (name, { command }) => {
            warningResult.actionStartList[command.actionId] = name;

        },
        reportTestActionDone: (name, { command }) => {
            warningResult.actionDoneList[command.actionId] = name;
        },
    });

    function assertReporterWarnings (actionName) {
        expect(warningResult.warnings.length).gte(1);

        for (const warning of warningResult.warnings) {
            expect(warningResult.actionStartList[warning.actionId]).eql(actionName);
            expect(warningResult.actionDoneList[warning.actionId]).eql(actionName);
        }
    }

    return {
        warningResult,
        assertReporterWarnings,
        reporter,
    };
};
