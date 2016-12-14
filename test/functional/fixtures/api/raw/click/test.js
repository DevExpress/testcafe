var expect                     = require('chai').expect;
var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;


describe('[Raw API] Click action', function () {
    it('Should make click on a button', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click simple button', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Click on input raised', 0);
            });
    });

    it('Should perform click on a submit button and wait for page redirect', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click submit button', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, "It's a submit page", 0);
            });
    });

    it('Should wait for the page load barrier to finish after an action', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Redirect after a timeout', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, "It's a submit page", 0);
            });
    });

    it('Should fail when a js-error appears on page load', function () {
        return runTests('./testcafe-fixtures/page-with-error.testcafe', null, { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Error on page "http://localhost:3000/fixtures/api/raw/click/pages/error.html":', 0);
                errorInEachBrowserContains(errs, 'Custom error ', 0);
                errorInEachBrowserContains(errs, '[[Click on simple button callsite]]', 0);
            });
    });

    it('Should fail when a js-error appears during click execution', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click error button', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Error on page "http://localhost:3000/fixtures/api/raw/click/pages/index.html":', 0);
                errorInEachBrowserContains(errs, 'Custom error', 0);
                errorInEachBrowserContains(errs, '[[Click error button callsite]]', 0);
            });
    });

    it('Should wait for xhr-requests after an action', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click xhr button', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Xhr requests are finished', 0);
            });
    });

    it('Should wait for the next action element to appear', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Wait for the next action target to appear',
            { shouldFail: true, selectorTimeout: 3000 })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Click on the new button raised', 0);
            });
    });

    it("Should fail if an action target doesn't exist", function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click non-existent button', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The specified selector does not match any element in the DOM tree.');
                expect(errs[0]).contains('[[Click non-existent button callsite]]');
            });
    });

    it('Should fail if an action target is invisible', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click invisible button', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The element that matches the specified selector is not visible.');
                expect(errs[0]).contains('[[Click invisible button callsite]]');
            });
    });

    it('Should fail if an action target is out of the visible area', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click a button that is out of the visible area', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The element that matches the specified selector is not visible.');
                expect(errs[0]).contains('[[Click a button that is out of the visible area callsite]]');
            });
    });

    it('Should fail if action has incorrect selector', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Incorrect action selector', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains(
                    'Action "selector" argument error:  Selector is expected to be initialized with a function, ' +
                    'CSS selector string, another Selector, node snapshot or a Promise returned by a Selector, but number was passed.'
                );

                expect(errs[0]).contains('[[Incorrect action selector callsite]]');
            });
    });

    it('Should fail if action has an incorrect option', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Incorrect action option', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The "offsetX" option is expected to be an integer, but it was string.');
                expect(errs[0]).contains('[[Incorrect action option callsite]]');
            });
    });
});
