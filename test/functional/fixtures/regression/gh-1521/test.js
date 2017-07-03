var expect = require('chai').expect;

describe('[Regression](GH-1521)', function () {
    it('Should wait for a timeout if an element is not in the viewport temporary', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Wait for an out-of-viewport element', { only: 'chrome' });
    });

    it('Should fail if an element is not in the viewport constantly', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Try to click on an out-of-viewport element', {
            only:       'chrome',
            shouldFail: true
        })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The element that matches the specified selector is not visible');
                expect(errs[0]).to.contains(' > 20 |        await t.click(Selector(\'#out-of-viewport-btn\', { timeout: 2000 }));');
            });
    });

    it.only('Should wait for a timeout if an element is overlapped', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Wait until element is not overlapped', { only: 'chrome' });
    });

    it.only('Should click on an overlapping element after some timeout', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Click on an overlapping element after some timeout', { only: 'chrome' });
    });
});
