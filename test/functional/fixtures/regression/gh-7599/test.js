const expect                     = require('chai').expect;
const { onlyInNativeAutomation } = require('../../../utils/skip-in');


describe('Multiple windows in the Native Automation mode', function () {
    onlyInNativeAutomation('Should fail in the Native Automation mode if window opened using the link click', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should fail on link[target="blank"] click', { shouldFail: true })
            .catch(errs => {
                expect(errs[0]).contains('Multi-window mode is not supported in the Native Automation mode. To run test in multiple windows, please remove the "--native-automation" option');
            });
    });

    onlyInNativeAutomation('Should fail in the Native Automation mode', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should fail on Multiple Window API call in the Native Automation mode', { shouldFail: true })
            .catch(errs => {
                expect(errs[0]).contains('Multi-window mode is not supported in the Native Automation mode. To run test in multiple windows, please remove the "--native-automation" option');
            });
    });
});
