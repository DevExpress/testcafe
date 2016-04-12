var expect = require('chai').expect;

// NOTE: we run tests in chrome only, because we mainly test server API functionality.
// Actions functionality is tested in lower-level raw API.
describe('[API] TestController', function () {
    it('Should should support chaining [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/test-controller-test.js', 'Chaining', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('-btn1-btn2-btn3-page2-btn1-page2-btn2');
            });
    });

    it('Should should produce correct callsites for chained calls [ONLY:chrome]', function () {
        return runTests('./testcafe-fixtures/test-controller-test.js', 'Chaining callsites', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains(
                    ' 16 |' +
                    ' 17 |test(\'Chaining callsites\', async t => {' +
                    ' 18 |    await t' +
                    ' 19 |        .click(\'#btn1\')' +
                    ' 20 |        .click(\'#btn2\')' +
                    ' > 21 |        .click(\'#error\')' +
                    ' 22 |        .click(\'#btn3\'); 23 |});' +
                    ' 24 |'
                );
            });
    });
});
