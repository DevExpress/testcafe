var expect = require('chai').expect;

describe('[Raw API] Wait for element action', function () {
    it("Should pass if the wait-for-element command's timeout exceeds time required for the element to appear", function () {
        return runTests('testcafe-fixtures/wait-for-element.testcafe', 'Wait for element with timeout enough for it to appear');
    });

    it("Should pass if the wait-for-element command's timeout exceeds time required to create the element", function () {
        return runTests('testcafe-fixtures/wait-for-element.testcafe', 'Wait for element with timeout enough to create it');
    });

    it("Should pass if the wait-for-element command's timeout exceeds time required for the element to appear (during page reloading)", function () {
        return runTests('testcafe-fixtures/page-with-forwarding.testcafe', 'Wait for element with timeout enough for it to appear');
    });

    it("Should fail if the wait-for-element command's timeout is less than time required for the element to appear", function () {
        return runTests('testcafe-fixtures/wait-for-element.testcafe', 'Wait for element with insufficient timeout',
            { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The element that matches the specified selector is not visible.');
            });
    });

    it("Should fail if the wait-for-element command's timeout is less than time required for the element to appear (default timeout)", function () {
        return runTests('testcafe-fixtures/wait-for-element.testcafe', 'Wait for element with the default timeout',
            { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The element that matches the specified selector is not visible.');
            });
    });
});
