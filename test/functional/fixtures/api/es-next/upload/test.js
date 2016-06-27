var expect = require('chai').expect;


describe('[API] Upload', function () {
    describe('t.setFilesToUpload', function () {
        it('Should upload the specified file', function () {
            return runTests('./testcafe-fixtures/upload-test.js', 'Upload the file', { only: 'chrome' });
        });

        it('Should validate the selector argument', function () {
            return runTests('./testcafe-fixtures/upload-test.js', 'Invalid selector argument (setFilesToUpload)', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'Action "selector" argument error:  Selector is expected to be initialized with a ' +
                        'function, CSS selector string, another Selector, node snapshot or a Promise returned ' +
                        'by a Selector, but undefined was passed.'
                    );
                    expect(errs[0]).contains('> 28 |    await t.setFilesToUpload(void 0, \'../test-data/file1.txt\');');
                });
        });

        it('Should validate the filePath argument', function () {
            return runTests('./testcafe-fixtures/upload-test.js', 'Invalid filePath argument', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains('The "filePath" argument is expected to be a non-empty string or a string array, but it was "".');
                    expect(errs[0]).contains('> 32 |    await t.setFilesToUpload(\'#file\', \'\');');
                });
        });
    });

    describe('t.clearUpload', function () {
        it('Should clear the upload', function () {
            return runTests('./testcafe-fixtures/upload-test.js', 'Clear the upload', { only: 'chrome' });
        });

        it('Should validate the selector argument', function () {
            return runTests('./testcafe-fixtures/upload-test.js', 'Invalid selector argument (clearUpload)', {
                shouldFail: true,
                only:       'chrome'
            })
                .catch(function (errs) {
                    expect(errs[0]).contains(
                        'Action "selector" argument error:  Selector is expected to be initialized with a ' +
                        'function, CSS selector string, another Selector, node snapshot or a Promise returned ' +
                        'by a Selector, but object was passed.'
                    );
                    expect(errs[0]).contains('> 36 |    await t.clearUpload(null);');
                });
        });
    });
});
