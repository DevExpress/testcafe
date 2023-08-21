const { onlyDescribeInNativeAutomation } = require('../../../utils/skip-in');
const { expect } = require('chai');

onlyDescribeInNativeAutomation('Should raise an error on running legacy tests in the native automation mode (GH-7942)', function () {
    it('Should raise an error on running legacy tests in the native automation mode (GH-7942)', function () {
        return runTests('./testcafe-fixtures/legacy.test.js', null, { only: 'chrome', shouldFail: true })
            .catch(err => {
                expect(err.message).eql('Cannot run legacy tests in the Native Automation mode. Use the "disable native automation" option to continue.');
            });
    });
});
