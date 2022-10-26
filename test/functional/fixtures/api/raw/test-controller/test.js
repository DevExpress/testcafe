const { expect } = require('chai');

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
// Actions functionality is tested in lower-level raw API.
describe('[Raw API] TestController', () => {
    it('Should produce correct callsites for chained calls', () => {
        return runTests('./testcafe-fixtures/test-controller-test.testcafe', 'Chaining callsites', {
            shouldFail: true,
            only:       'chrome',
        })
            .catch(errs => {
                expect(errs[0]).to.contains(
                    ' 2 |Click (Selector(\'#btn2\'))' +
                    ' > 3 |Click (Selector(\'#errorrr\'))' +
                    ' 4 |Click (Selector(\'#btn3\'))'
                );
            });
    });

    it('Should produce correct callsites for chained calls in hooks', () => {
        return runTests('./testcafe-fixtures/hooks-test.testcafe', 'Chaining callsites in hooks', {
            shouldFail: true,
            only:       'chrome',
        })
            .catch(errs => {
                expect(errs[0]).to.contains(
                    ' 2 |Click (Selector(\'#btn2\'))' +
                    ' > 3 |Click (Selector(\'#errorrr\'))' +
                    ' 4 |Click (Selector(\'#btn3\'))'
                );
            });
    });

    it('Should produce correct callsites with assertions for chained calls', () => {
        return runTests('./testcafe-fixtures/test-controller-test.testcafe', 'Chaining callsites with assertions', {
            shouldFail: true,
            only:       'chrome',
        })
            .catch(errs => {
                expect(errs[0]).to.contains(
                    ' > 1 |Assertion (Selector(\'.some-div\').exists) ok ()' +
                    ' 2 |Assertion (Selector(\'.some-div\').innerText) ok (innerText)'
                );
            });
    });
});
