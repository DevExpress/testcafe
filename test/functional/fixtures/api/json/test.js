const { expect }          = require('chai');
const path                = require('path');
const { skipInProxyless } = require('../../../utils/skip-in');

describe('[API] DevTools Compiler', function () {
    it('Should make click on a button', function () {
        return runTests('./testcafe-fixtures/click-test.json', null, { only: 'chrome' });
    });

    skipInProxyless('Should make hover on a button', function () {
        return runTests('./testcafe-fixtures/hover-test.json', null, { only: 'chrome' });
    });

    it('Should make dblclick on a button', function () {
        return runTests('./testcafe-fixtures/dblclick-test.json', null, { only: 'chrome' });
    });

    it('Should make rclick on a button', function () {
        return runTests('./testcafe-fixtures/rclick-test.json', null, { only: 'chrome' });
    });

    it('Should throw error clicking on unexisting element', function () {
        const now = Date.now();

        return runTests('./testcafe-fixtures/click-failure-test.json', null, {
            only:            'chrome',
            shouldFail:      true,
            selectorTimeout: 50000,
        })
            .catch(errs => {
                expect(errs[0]).contains('The specified selector does not match any element in the DOM tree');
                expect(errs[0]).contains(' > | Selector(\'#nonExistingElement\')');
                expect(Date.now() - now).lt(10000);
            });
    });

    it('Should type text into a text input', function () {
        return runTests('./testcafe-fixtures/change-input-test.json', null, { only: 'chrome' });
    });

    it('Should type text into a textarea', function () {
        return runTests('./testcafe-fixtures/change-textarea-test.json', null, { only: 'chrome' });
    });

    it('Should choose an option inside of a select', function () {
        return runTests('./testcafe-fixtures/change-select-test.json', null, { only: 'chrome' });
    });

    it('Should emulate events on the keyboard events`', function () {
        return runTests('./testcafe-fixtures/press-test.json', null, { only: 'chrome' });
    });

    it('Should scroll document and element', function () {
        return runTests('./testcafe-fixtures/scroll-test.json', null, { only: 'chrome' });
    });

    it('Should wait for an element', function () {
        return runTests('./testcafe-fixtures/wait-for-element-test.json', null, { only: 'chrome' });
    });

    skipInProxyless('Should switch to iframe', function () {
        return runTests('./testcafe-fixtures/iframe-test.json', null, { only: 'chrome' });
    });

    it('Should throw an error in command is invalid', function () {
        return runTests('./testcafe-fixtures/invalid-test.json', null, {
            only:       'chrome',
            shouldFail: true,
        })
            .catch(err => {
                const filepath = path.join(__dirname, 'testcafe-fixtures', 'invalid-test.json');

                expect(err.message).contains(
                    'TestCafe terminated the test run. The "' +
                    filepath +
                    '" file contains an unknown Chrome User Flow action "invalid". ' +
                    'Remove the action to continue. Refer to the following article for the definitive list of supported Chrome User Flow actions: ' +
                    'https://testcafe.io/documentation/403998/guides/experimental-capabilities/chrome-replay-support#supported-replay-actions'
                );
            });
    });

    skipInProxyless('Should click inside shadow DOM', function () {
        return runTests('./testcafe-fixtures/shadow-dom-test.json', null, {
            only:       'chrome',
            shouldFail: true,
        })
            .catch(errs => {
                expect(errs[0]).contains('shadow button clicked');
            });
    });

    it('JSON without tests', function () {
        return runTests('./testcafe-fixtures/json-without-test.json', null, {
            only:       'chrome',
            shouldFail: true,
        })
            .catch(err => {
                expect(err.message).contains('Source files do not contain valid \'fixture\' and \'test\' declarations.');
            });
    });
});
