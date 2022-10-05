const expect                     = require('chai').expect;
const errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;


describe('[Raw API] Hover action', function () {
    it('Should make hover on a buttons', function () {
        return runTests('./testcafe-fixtures/hover.testcafe', 'Hover on simple buttons', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Hover on inputs raised', 0);
            });
    });

    it('Should fail if an action target is out of the visible area', function () {
        return runTests('./testcafe-fixtures/hover.testcafe', 'Hover on a button that is out of the visible area', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The element: \'<input type="button" id="out-of-visible-area" style="position: absolute; left: -100px; top: -100px;">\' is outside the visible bounds of the document.');
                expect(errs[0]).contains('[[Hover on a button that is out of the visible area callsite]]');
            });
    });
});
