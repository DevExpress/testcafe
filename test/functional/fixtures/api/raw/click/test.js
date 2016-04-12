var expect = require('chai').expect;

describe('[Raw API] Click action', function () {
    it('Should make click on a button', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click simple button', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Click on input raised');
            });
    });

    it('Should perform click on a submit button and wait for page redirect', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click submit button', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains("It's a submit page");
            });
    });

    it('Should wait for the page load barrier to finish after an action', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Redirect after a timeout', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains("It's a submit page");
            });
    });

    it('Should fail when a js-error appears on page load', function () {
        return runTests('./testcafe-fixtures/page-with-error.testcafe', null, { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Uncaught JavaScript error Uncaught Error: Custom error');
                expect(err).to.contains('[[Click on simple button callsite]]');
            });
    });

    it('Should fail when a js-error appears during click execution', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click error button', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Uncaught JavaScript error Uncaught Error: Custom error');
                expect(err).to.contains('[[Click error button callsite]]');
            });
    });

    it('Should wait for xhr-requests after an aciton', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click xhr button', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Xhr requests are finished');
            });
    });

    it('Should wait for the next action element to appear', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Wait for next action target appeared', { shouldFail: true })
            .catch(function (err) {
                expect(err).to.contains('Click on the new button raised');
            });
    });

    it("Should fail if an action target doesn't exist", function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click non-existent button', { shouldFail: true })
            .catch(function (err) {
                expect(err).eql('The specified selector does not match any element in the DOM tree.  ' +
                                '[[Click non-existent button callsite]]');
            });
    });

    it('Should fail if an action target is invisible', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click invisible button', { shouldFail: true })
            .catch(function (err) {
                expect(err).eql('The element that matches the specified selector is not visible.  ' +
                                '[[Click invisible button callsite]]');
            });
    });

    it('Should fail if action has incorrect selector', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Incorrect action selector', { shouldFail: true })
            .catch(function (err) {
                expect(err).eql('Action selector is expected to be a string, but it was number.  ' +
                                '[[Incorrect action selector callsite]]');
            });
    });

    it('Should fail if action has option', function () {
        return runTests('./testcafe-fixtures/click.testcafe', 'Incorrect action option', { shouldFail: true })
            .catch(function (err) {
                expect(err).eql('Action option offsetX is expected to be a positive number, but it was string.  ' +
                                '[[Incorrect action option callsite]]');
            });
    });
});
