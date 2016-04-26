var expect                     = require('chai').expect;
var errorInEachBrowserContains = require('../../../../assertion-helper.js').errorInEachBrowserContains;


describe('[Raw API] Upload', function () {
    it('Should upload a file', function () {
        return runTests('./testcafe-fixtures/upload.testcafe', 'Upload a file', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'File uploaded', 0);
            });
    });

    it('Should fail if the action element is not a file input', function () {
        return runTests('./testcafe-fixtures/upload.testcafe', 'The action element is not a file input', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The specified selector does not match a file input element.');
            });
    });

    it('Should fail if the specified file does not exist', function () {
        return runTests('./testcafe-fixtures/upload.testcafe', 'The specified file does not exist', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('Cannot find the following file(s) to upload: ');
                expect(errs[0]).contains('test42.txt');
            });
    });

    it('Should upload files', function () {
        return runTests('./testcafe-fixtures/upload.testcafe', 'Upload files', { shouldFail: true })
            .catch(function (errs) {
                errorInEachBrowserContains(errs, 'Files uploaded', 0);
            });
    });

    it('Should fail if the specified file does not exist when multiple files are specified', function () {
        return runTests('./testcafe-fixtures/upload.testcafe', 'The specified file does not exist (multiple files)', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('Cannot find the following file(s) to upload: ');
                expect(errs[0]).contains('test42.txt');
                expect(errs[0]).not.contains('test3.txt');
            });
    });

    it('Should clear the upload', function () {
        return runTests('./testcafe-fixtures/upload.testcafe', 'Clear the upload', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The specified selector does not match any element in the DOM tree.');
            });
    });

    it('Should fail if the action element is not a file input when clearing upload', function () {
        return runTests('./testcafe-fixtures/upload.testcafe', 'The action element is not a file input (clearing upload)', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The specified selector does not match a file input element.');
            });
    });
});
