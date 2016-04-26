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
                errorInEachBrowserContains(errs, 'Error on page "http://localhost:3000/api/raw/click/pages/error.html":', 0);
                errorInEachBrowserContains(errs, 'Custom error  [[Click on simple button callsite]]', 0);
            });
    });

    it('Should fail when a js-error appears during click execution', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click error button', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Error on page "http://localhost:3000/api/raw/click/pages/index.html":', 0);
                errorInEachBrowserContains(errs, 'Custom error  [[Click error button callsite]]', 0);
            });
    });

    it('Should wait for xhr-requests after an aciton', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click xhr button', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Xhr requests are finished', 0);
            });
    });

    it('Should wait for the next action element to appear', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Wait for the next action target to appear',
            { shouldFail: true, elementAvailabilityTimeout: 3000 })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Click on the new button raised', 0);
            });
    });

    it("Should fail if an action target doesn't exist", function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click non-existent button', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).eql('The specified selector does not match any element in the DOM tree.  ' +
                                    '[[Click non-existent button callsite]]');
            });
    });

    it('Should fail if an action target is invisible', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click invisible button', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).eql('The element that matches the specified selector is not visible.  ' +
                                    '[[Click invisible button callsite]]');
            });
    });

    it('Should fail if action has incorrect selector', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Incorrect action selector', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).eql('The selector is expected to be a string, but it was number.  ' +
                                    '[[Incorrect action selector callsite]]');
            });
    });

    it('Should fail if action has an incorrect option', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Incorrect action option', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).eql('Action option offsetX is expected to be a positive integer, but it was string.  ' +
                                    '[[Incorrect action option callsite]]');
            });
    });
});
