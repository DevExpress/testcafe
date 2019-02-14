const { expect }                     = require('chai');
const { errorInEachBrowserContains } = require('../../../../assertion-helper.js');


describe('[Raw API] Click action', () => {
    it('Should make click on a button', () => {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click simple button', { shouldFail: true })
            .catch(errs => {
                errorInEachBrowserContains(errs, 'Click on input raised', 0);
            });
    });

    it('Should perform click on a submit button and wait for page redirect', () => {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click submit button', { shouldFail: true })
            .catch(errs => {
                errorInEachBrowserContains(errs, "It's a submit page", 0);
            });
    });

    it('Should wait for the page load barrier to finish after an action', () => {
        return runTests('./testcafe-fixtures/click.testcafe', 'Redirect after a timeout', { shouldFail: true })
            .catch(errs => {
                errorInEachBrowserContains(errs, "It's a submit page", 0);
            });
    });

    it('Should fail when a js-error appears on page load', () => {
        return runTests('./testcafe-fixtures/page-with-error.testcafe', null, { shouldFail: true })
            .catch(errs => {
                errorInEachBrowserContains(errs, 'A JavaScript error occurred on "http://localhost:3000/fixtures/api/raw/click/pages/error.html"', 0);
                errorInEachBrowserContains(errs, 'Custom error', 0);
                errorInEachBrowserContains(errs, '[[Click on simple button callsite]]', 0);
            });
    });

    it('Should fail when a js-error appears during click execution', () => {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click error button', { shouldFail: true })
            .catch(errs => {
                errorInEachBrowserContains(errs, 'A JavaScript error occurred on "http://localhost:3000/fixtures/api/raw/click/pages/index.html"', 0);
                errorInEachBrowserContains(errs, 'Custom error', 0);
                errorInEachBrowserContains(errs, '[[Click error button callsite]]', 0);
            });
    });

    it('Should wait for xhr-requests after an action', () => {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click xhr button', { shouldFail: true })
            .catch(errs => {
                errorInEachBrowserContains(errs, 'Xhr requests are finished', 0);
            });
    });

    it('Should wait for the next action element to appear', () => {
        return runTests('./testcafe-fixtures/click.testcafe', 'Wait for the next action target to appear',
            { shouldFail: true, selectorTimeout: 3000 })
            .catch(errs => {
                errorInEachBrowserContains(errs, 'Click on the new button raised', 0);
            });
    });

    it("Should fail if an action target doesn't exist", () => {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click non-existent button', { shouldFail: true })
            .catch(errs => {
                expect(errs[0]).contains(
                    'The specified selector does not match any element in the DOM tree.' +
                    '  > | Selector(\'#new-button\')'
                );
                expect(errs[0]).contains('[[Click non-existent button callsite]]');
            });
    });

    it('Should fail if an action target is invisible', () => {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click invisible button', { shouldFail: true })
            .catch(errs => {
                expect(errs[0]).contains('The element that matches the specified selector is not visible.');
                expect(errs[0]).contains('[[Click invisible button callsite]]');
            });
    });

    it('Should fail if an action target is out of the visible area', () => {
        return runTests('./testcafe-fixtures/click.testcafe', 'Click a button that is out of the visible area', { shouldFail: true })
            .catch(errs => {
                expect(errs[0]).contains('The element that matches the specified selector is not visible.');
                expect(errs[0]).contains('[[Click a button that is out of the visible area callsite]]');
            });
    });

    it('Should fail if action has incorrect selector', () => {
        return runTests('./testcafe-fixtures/click.testcafe', 'Incorrect action selector', { shouldFail: true })
            .catch(errs => {
                expect(errs[0]).contains(
                    'Action "selector" argument error:  Selector is expected to be initialized with a function, ' +
                    'CSS selector string, another Selector, node snapshot or a Promise returned by a Selector, but number was passed.'
                );

                expect(errs[0]).contains('[[Incorrect action selector callsite]]');
            });
    });

    it('Should fail if action has an incorrect option', () => {
        return runTests('./testcafe-fixtures/click.testcafe', 'Incorrect action option', { shouldFail: true })
            .catch(errs => {
                expect(errs[0]).contains('The "offsetX" option is expected to be an integer, but it was string.');
                expect(errs[0]).contains('[[Incorrect action option callsite]]');
            });
    });
});
