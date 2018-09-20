const pageUrl                            = 'http://localhost:3000/fixtures/api/es-next/native-dialogs-handling/pages/index.html';
const errorInEachBrowserContains         = require('../../../../assertion-helper.js').errorInEachBrowserContains;
const getNativeDialogNotHandledErrorText = require('../../es-next/native-dialogs-handling/errors.js').getNativeDialogNotHandledErrorText;

describe('Native dialogs handling', function () {
    it('Should pass if the expected confirm dialog appears after an action', function () {
        return runTests('./testcafe-fixtures/native-dialogs-test.testcafe', 'Expected confirm after an action');
    });

    it('Should pass if the expected confirm dialog appears after an action (client function)', function () {
        return runTests('./testcafe-fixtures/native-dialogs-test.testcafe', 'Expected confirm after an action (client function)');
    });

    it('Should fail if Selector send as dialog handler', function () {
        return runTests('./testcafe-fixtures/native-dialogs-test.testcafe', 'Selector as dialogHandler', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'The native dialog handler is expected to be a function, ClientFunction or null, but it was Selector.', 0);
            });
    });

    it('Should fail if dialog handler has wrong type', function () {
        return runTests('./testcafe-fixtures/native-dialogs-test.testcafe', 'Dialog handler has wrong type', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'The native dialog handler is expected to be a function, ClientFunction or null, but it was number.', 0);
            });
    });

    it('Should remove dialog handler if `null` specified', function () {
        return runTests('./testcafe-fixtures/native-dialogs-test.testcafe', 'Null handler', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, getNativeDialogNotHandledErrorText('alert', pageUrl), 0);
            });
    });
});
