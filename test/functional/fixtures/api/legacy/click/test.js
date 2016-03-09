var expect = require('chai').expect;


describe('api click test', function () {
    it('Should fail if the first argument is invisible', function () {
        return runTests('testcafe-fixtures/click.test.js', 'Should fail if the first argument is invisible', { shouldFail: true })
            .catch(function (err) {
                var expectedError = [
                    'Error at step "1.Click on invisible element":',
                    '',
                    'act.click($input);',
                    '',
                    'A target element \<input id="input"\> of the click action is not visible.',
                    'If this element should appear when you are hovering over another',
                    'element, make sure that you properly recorded the hover action.'
                ].join(' ');

                expect(err).eql(expectedError);
            });
    });

    it('Pointer events test (T191183) [ONLY:ie]', function () {
        return runTests('testcafe-fixtures/click.test.js', 'Pointer events test (T191183) [ONLY:ie]');
    });
});
