var expect = require('chai').expect;
var globby = require('globby').sync;
var path   = require('path');


describe('[Legacy] Smoke tests', function () {
    it('Should run basic tests', function () {
        return runTests(globby(path.join(__dirname, './testcafe-fixtures/basic/*test.js')), null, { skip: 'iphone,ipad' });
    });

    it('Should fail on errors', function () {
        return runTests('./testcafe-fixtures/errors.test.js', null, { shouldFail: true, skip: 'iphone,ipad' })
            .catch(function (errs) {
                expect(errs[0]).contains('A target element of the click action has not been found in the DOM tree.');
            });
    });
});
