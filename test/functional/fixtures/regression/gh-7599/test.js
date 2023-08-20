const { expect }                         = require('chai');
const { onlyDescribeInNativeAutomation } = require('../../../utils/skip-in');


onlyDescribeInNativeAutomation('Multiple windows in the Native Automation mode', function () {
    it('Should fail in the Native Automation mode if window opened using the link click', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should fail on link[target="blank"] click', { shouldFail: true })
            .catch(errs => {
                expect(errs[0]).contains('The Native Automation mode does not support the use of multiple browser windows. Use the "disable native automation" option to continue');
            });
    });

    it('Should fail in the Native Automation mode', function () {
        return runTests('./testcafe-fixtures/index.js', 'Should fail on Multiple Window API call in the Native Automation mode', { shouldFail: true })
            .catch(errs => {
                expect(errs[0]).contains('The Native Automation mode does not support the use of multiple browser windows. Use the "disable native automation" option to continue');
            });
    });

    describe('disableMultipleWindows', function () {
        const TEST_RUN_OPTIONS = {
            disableMultipleWindows: true,
            only:                   'chrome',
        };

        it('window.open', function () {
            return runTests('./testcafe-fixtures/disable-multiple-windows.js', 'window.open', TEST_RUN_OPTIONS);
        });

        it('click on link', function () {
            return runTests('./testcafe-fixtures/disable-multiple-windows.js', 'click on link', TEST_RUN_OPTIONS);
        });

        it('form submit', function () {
            return runTests('./testcafe-fixtures/disable-multiple-windows.js', 'form submit', TEST_RUN_OPTIONS);
        });
    });
});
