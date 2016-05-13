var expect = require('chai').expect;


describe('Upload', function () {
    it('Should upload a file', function () {
        return runTests('testcafe-fixtures/upload.test.js', 'Upload a file');
    });

    it('Should upload multiple files', function () {
        return runTests('testcafe-fixtures/upload.test.js', 'Upload multiple files');
    });

    it('Should clear the upload', function () {
        return runTests('testcafe-fixtures/upload.test.js', 'Clear upload');
    });

    it('Should fail when uploading a non-existent file', function () {
        return runTests('testcafe-fixtures/upload.test.js', 'Upload a non-existent file - should fail', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('fake.jpg');
            });
    });

    it('Should fail when uploading multiple files including non-existent files', function () {
        return runTests('testcafe-fixtures/upload.test.js', 'Upload multiple files inc. non-existent - should fail', { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('fake1.jpg');
                expect(errs[0]).contains('fake2.jpg');
                expect(errs[0]).not.contains('text1.txt');
            });
    });

    describe('Regression', function () {
        it('Should upload files with an added input', function () {
            return runTests('testcafe-fixtures/regression.test.js', 'Upload by using an added element');
        });

        it('Should upload files with a replaced input', function () {
            return runTests('testcafe-fixtures/regression.test.js', 'Upload by using a replaced element');
        });

        it("Shouldn't upload files with a removed input", function () {
            return runTests('testcafe-fixtures/regression.test.js', 'Upload by using a removed element');
        });
    });
});
