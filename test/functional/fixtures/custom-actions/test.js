const {
    clickBySelector,
    getSpanTextBySelector,
    typeTextAndClickButton,
    typeToInputAndCheckResult, getTextValue,
} = require('./actions');

const { expect }         = require('chai');
const config             = require('../../config');
const { createReporter } = require('../../utils/reporter');

(config.experimentalDebug ? describe.skip : describe)('[API] Custom Actions', function () {
    it('Should run custom click action', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should run custom click action', { customActions: { clickBySelector } });
    });

    it('Should return value from custom action', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should return value from custom action', {
            customActions: {
                clickBySelector,
                getSpanTextBySelector,
            },
        });
    });

    it('Should chain multiple actions inside custom action', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should chain multiple actions', {
            customActions: {
                typeTextAndClickButton,
            },
        });
    });

    it('Should run custom action inside another custom action', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should run custom action inside another custom action', {
            customActions: {
                typeToInputAndCheckResult,
                typeTextAndClickButton,
                getSpanTextBySelector,
            },
        });
    });

    it('Should run non-async custom action', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should run non-async custom action', {
            customActions: {
                getTextValue,
            },
        });
    });

    it('Should throw an exception inside custom action', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should throw an exception inside custom action', {
            customActions: { clickBySelector },
            shouldFail:    true,
        })
            .catch(errs => {
                expect(errs[0]).contains('The specified selector does not match any element in the DOM tree.');
            });
    });

    it('Should throw an exception due to undefined action', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should throw an exception inside custom action', {
            shouldFail: true,
        })
            .catch(errs => {
                expect(errs[0]).contains('TypeError: t.custom.clickBySelector is not a function');
            });
    });

    it('Should report all actions in correct order', function () {
        function ReporterRecord (phase, actionName, command) {
            this.phase      = phase;
            this.actionName = actionName;
            if (command.type !== 'run-custom-action')
                return this;

            delete command.actionId;
            delete command.fn;
            delete command.args;

            this.command = command;
        }

        const result         = [];
        const expectedResult = [
            { phase: 'start', actionName: 'runCustomAction', command: { type: 'run-custom-action', name: 'typeToInputAndCheckResult' } },
            { phase: 'start', actionName: 'runCustomAction', command: { type: 'run-custom-action', name: 'typeTextAndClickButton' } },
            { phase: 'start', actionName: 'typeText' },
            { phase: 'end', actionName: 'typeText' },
            { phase: 'start', actionName: 'click' },
            { phase: 'end', actionName: 'click' },
            { phase: 'end', actionName: 'runCustomAction', command: { type: 'run-custom-action', name: 'typeTextAndClickButton' } },
            { phase: 'start', actionName: 'runCustomAction', command: { type: 'run-custom-action', name: 'getSpanTextBySelector' } },
            { phase: 'start', actionName: 'execute-selector' },
            { phase: 'end', actionName: 'execute-selector' },
            {
                phase:      'end',
                actionName: 'runCustomAction',
                command:    {
                    type:         'run-custom-action',
                    name:         'getSpanTextBySelector',
                    actionResult: 'Some text',
                },
            },
            { phase: 'start', actionName: 'eql' },
            { phase: 'end', actionName: 'eql' },
            { phase: 'end', actionName: 'runCustomAction', command: { type: 'run-custom-action', name: 'typeToInputAndCheckResult' } },
        ];

        const reporter = createReporter({
            reportTestActionStart: (name, { command }) => {
                result.push(new ReporterRecord('start', name, command));
            },
            reportTestActionDone: (name, { command }) => {
                result.push(new ReporterRecord('end', name, command));
            },
        });

        return runTests('./testcafe-fixtures/index.js', 'Should run custom action inside another custom action', {
            customActions: {
                typeToInputAndCheckResult,
                typeTextAndClickButton,
                getSpanTextBySelector,
            },
            reporter,
        }).then(() => {
            expect(result).to.deep.equal(expectedResult);
        });
    });
});

