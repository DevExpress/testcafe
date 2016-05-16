var expect = require('chai').expect;


describe('[API] Upload', function () {
    describe('t.uploadFile', function () {
        it('Should upload the specified file', function () {
            return runTests('./testcafe-fixtures/upload-test.js', 'Upload the file', { only: 'chrome' });
        });

        it('Should validate the selector argument', function () {
            return runTests('./testcafe-fixtures/upload-test.js', 'Invalid selector argument (uploadFile)', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('The selector is expected to be a string, but it was undefined.');
                    expect(errs[0]).contains('> 28 |    await t.uploadFile(void 0, \'../test-data/file1.txt\');');
                });
        });

        it('Should validate the filePath argument', function () {
            return runTests('./testcafe-fixtures/upload-test.js', 'Invalid filePath argument', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('The filePath argument is expected to be a non-empty string or a string array, but it was "".');
                    expect(errs[0]).contains('> 32 |    await t.uploadFile(\'#file\', \'\');');
                });
        });
    });

    describe('t.clearUpload', function () {
        it('Should clear the upload', function () {
            return runTests('./testcafe-fixtures/upload-test.js', 'Clear the upload', { only: 'chrome' });
        });

        it('Should validate the selector argument', function () {
            return runTests('./testcafe-fixtures/upload-test.js', 'Invalid selector argument (clearUpload)', { shouldFail: true, only: 'chrome' })
                .catch(function (errs) {
                    expect(errs[0]).contains('The selector is expected to be a string, but it was object.');
                    expect(errs[0]).contains('> 36 |    await t.clearUpload(null);');
                });
        });
    });
});
