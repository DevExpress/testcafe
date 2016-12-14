var expect = require('chai').expect;

describe('[API] t.doubleClick()', function () {
    it('Should make double click on a button', function () {
        return runTests('./testcafe-fixtures/double-click-test.js', 'Double click on a button', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).to.contains('Click on button raised 2 times. Double click on button raised.');
                expect(errs[0]).to.contains(' >  7 |    await t.doubleClick(\'#button\');');
            });
    });

    it('Should validate options', function () {
        return runTests('./testcafe-fixtures/double-click-test.js', 'Incorrect action option', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).to.contains('The "offsetX" option is expected to be an integer, but it was 3.14.');
                expect(errs[0]).to.contains(' > 15 |    await t.doubleClick(\'#button\', { offsetX: 3.14 });');
            });
    });

    it('Should validate selector', function () {
        return runTests('./testcafe-fixtures/double-click-test.js', 'Incorrect action selector', {
            shouldFail: true,
            only:       'chrome'
        })
            .catch(function (errs) {
                expect(errs[0]).to.contains(
                    'Action "selector" argument error:  Selector is expected to be initialized with a ' +
                    'function, CSS selector string, another Selector, node snapshot or a Promise ' +
                    'returned by a Selector, but object was passed.'
                );
                expect(errs[0]).to.contains(' > 11 |    await t.doubleClick(null);');
            });
    });
});
