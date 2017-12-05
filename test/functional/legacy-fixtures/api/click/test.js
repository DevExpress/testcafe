var expect = require('chai').expect;


describe('[Legacy API] act.click()', function () {
    it('Should fail if the first argument is invisible', function () {
        return runTests('testcafe-fixtures/click.test.js', 'Should fail if the first argument is invisible', { shouldFail: true })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "1.Click on invisible element":',
                    'A target element <input id="input"> of the click action is not visible.',
                    'If this element should appear when you are hovering over another',
                    'element, make sure that you properly recorded the hover action.'
                ].join(' ');

                expect(errs[0]).contains(expectedError);
                expect(errs[0]).contains('act.click($input);');
            });
    });

    it('Should fail if the first argument is out of the visible area', function () {
        return runTests('testcafe-fixtures/click.test.js', 'Should fail if the first argument is invisible', { shouldFail: true })
            .catch(function (errs) {
                var expectedError = [
                    'Error at step "1.Click on invisible element":',
                    'A target element <input id="input"> of the click action is not visible.',
                    'If this element should appear when you are hovering over another',
                    'element, make sure that you properly recorded the hover action.'
                ].join(' ');

                expect(errs[0]).contains(expectedError);
                expect(errs[0]).contains('act.click($input);');
            });
    });

    it('Pointer events test (T191183) [ONLY:ie]', function () {
        return runTests('testcafe-fixtures/click.test.js', 'Pointer events test (T191183)', { only: 'ie' });
    });
});
