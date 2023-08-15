const { onlyInNativeAutomation } = require('../../../utils/skip-in');
const expect = require('chai').expect;

const EXPECTED_ERROR = 'The Native Automation mode does not support the use of multiple browser windows. Use the "disable native automation" option to continue.';

describe('Disable multiple windows in Native Automation', function () {
    onlyInNativeAutomation('disableMultipleWindows is enabled', function () {
        return runTests('testcafe-fixtures/index.js', null, { disableMultipleWindows: true, shouldFail: true })
            .catch(errs => {
                expect(errs.length).eql(2);
                expect(errs[0]).contains(EXPECTED_ERROR);
                expect(errs[1]).contains(EXPECTED_ERROR);
            });
    });

    onlyInNativeAutomation('disableMultipleWindows is disabled', function () {
        return runTests('testcafe-fixtures/index.js', null, { disableMultipleWindows: false, shouldFail: true })
            .catch(errs => {
                expect(errs.length).eql(2);
                expect(errs[0]).contains(EXPECTED_ERROR);
                expect(errs[1]).contains(EXPECTED_ERROR);
            });
    });
});


