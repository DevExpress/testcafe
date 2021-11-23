const { expect } = require('chai');

describe('[API] Cookies', function () {
    describe('t.getCookies', function () {
        it('Should get cookies', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should get cookies');
        });

        it('Should throw an error if an invalid "cookie" argument is specified in t.getCookies(cookie)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "cookie" argument is specified in t.getCookies(cookie)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "cookie" argument is expected to be a cookie-like object or a cookie-like object array.');
                });
        });

        it('Should throw an error if a "cookie" argument contains invalid cookie array elements in t.getCookies(cookie)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if a "cookie" argument contains invalid cookie array elements in t.getCookies(cookie)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "cookie" argument is expected to be cookie-like objects, but the element at index 1 wasn\'t.');
                });
        });

        it('Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.getCookies(...cookies)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.getCookies(...cookies)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "cookie" argument at position 2 is expected to be a cookie-like object or a cookie-like object array.');
                });
        });

        it('Should throw an error if invalid "...cookies" arguments are specified in t.getCookies(...cookies)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if invalid "...cookies" arguments are specified in t.getCookies(...cookies)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The elements of the "cookie" argument at position 2 are expected to be cookie-like objects, but the element at index 1 wasn\'t.');
                });
        });

        it('Should throw an error if an invalid "names" argument is specified in t.getCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "names" argument is specified in t.getCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "names" argument is expected to be a string or a string array, but it was number.');
                });
        });

        it('Should throw an error if an invalid "names" array argument is specified in t.getCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "names" array argument is specified in t.getCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "names" argument are expected to be non-empty strings, but the element at index 1 was object.');
                });
        });

        it('Should throw an error if an invalid "urls" argument is specified in t.getCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "urls" argument is specified in t.getCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "urls" argument is expected to be a string or a string array, but it was number.');
                });
        });

        it('Should throw an error if an invalid "urls" array argument is specified in t.getCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "urls" array argument is specified in t.getCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "urls" argument are expected to be non-empty strings, but the element at index 1 was object.');
                });
        });
    });

    describe('t.setCookies', function () {
        it('Should set cookies', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should set cookies');
        });

        it('Should throw an error if an invalid "cookie" argument is specified in t.setCookies(cookie)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "cookie" argument is specified in t.setCookies(cookie)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "cookie" argument is expected to be a cookie-like object or a cookie-like object array.');
                });
        });

        it('Should throw an error if a "cookie" argument contains invalid cookie array elements in t.setCookies(cookie)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if a "cookie" argument contains invalid cookie array elements in t.setCookies(cookie)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "cookie" argument is expected to be cookie-like objects, but the element at index 1 wasn\'t.');
                });
        });

        it('Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.setCookies(...cookies)', function () { ///
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.setCookies(...cookies)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "cookie" argument at position 2 is expected to be a cookie-like object or a cookie-like object array.');
                });
        });

        it('Should throw an error if invalid "...cookies" arguments are specified in t.setCookies(...cookies)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if invalid "...cookies" arguments are specified in t.setCookies(...cookies)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The elements of the "cookie" argument at position 2 are expected to be cookie-like objects, but the element at index 1 wasn\'t.');
                });
        });

        it('Should throw an error if an invalid "nameValueObjects" argument is specified in t.setCookies(nameValueObjects, url)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "nameValueObjects" argument is specified in t.setCookies(nameValueObjects, url)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "nameValueObjects" argument is expected to be a name-value object or a name-value object array.');
                });
        });

        it('Should throw an error if an invalid "nameValueObjects" array argument is specified in t.setCookies(nameValueObjects, url)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "nameValueObjects" array argument is specified in t.setCookies(nameValueObjects, url)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "nameValueObjects" argument are expected to be name-value objects, but the element at index 1 is not one of them.');
                });
        });

        it('Should throw an error if the required "url" argument is not specified in t.setCookies(nameValueObjects, url)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if the required "url" argument is not specified in t.setCookies(nameValueObjects, url)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "url" argument is required if the cookie is represented by a name-value object.');
                });
        });

        it('Should throw an error if no parameters are specified in t.setCookies()', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if no parameters are specified in t.setCookies()')
                .catch(function (errs) {
                    expect(errs[0]).contains('Required parameters ("cookies" or a pair of "nameValueObjects" and "url") are missed.');
                });
        });

        it('Should throw an error if an "url" argument has a wrong type in t.setCookies(nameValueObjects, url)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an "url" argument has a wrong type in t.setCookies(nameValueObjects, url)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "url" argument is expected to be a non-empty string, but it was object.');
                });
        });

        it('Should throw an error if an empty string is set as the "url" argument in t.setCookies(nameValueObjects, url)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an empty string is set as the "url" argument in t.setCookies(nameValueObjects, url)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "url" argument is expected to be a non-empty string, but it was ""');
                });
        });

        it('Should throw an error if an "url" argument is represented by invalid URL string (t.setCookies(nameValueObjects, url))', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if a protocol part of the "url" argument cannot be parsed (t.setCookies(nameValueObjects, url))')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "url" argument is expected to be an URL, but it was not valid URL.');
                });
        });
    });

    describe('t.deleteCookies', function () {
        it('Should delete cookies', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should delete cookies');
        });

        it('Should throw an error if an invalid "cookie" argument is specified in t.deleteCookies(cookie)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "cookie" argument is specified in t.deleteCookies(cookie)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "cookie" argument is expected to be a cookie-like object or a cookie-like object array.');
                });
        });

        it('Should throw an error if a "cookie" argument contains invalid cookie array elements in t.deleteCookies(cookie)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if a "cookie" argument contains invalid cookie array elements in t.deleteCookies(cookie)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "cookie" argument is expected to be cookie-like objects, but the element at index 1 wasn\'t.');
                });
        });

        it('Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.deleteCookies(...cookies)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.deleteCookies(...cookies)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "cookie" argument at position 2 is expected to be a cookie-like object or a cookie-like object array.');
                });
        });

        it('Should throw an error if invalid "...cookies" arguments are specified in t.deleteCookies(...cookies)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if invalid "...cookies" arguments are specified in t.deleteCookies(...cookies)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The elements of the "cookie" argument at position 2 are expected to be cookie-like objects, but the element at index 1 wasn\'t.');
                });
        });

        it('Should throw an error if an invalid "names" argument is specified in t.deleteCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "names" argument is specified in t.deleteCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "names" argument is expected to be a string or a string array, but it was number.');
                });
        });

        it('Should throw an error if an invalid "names" array argument is specified in t.deleteCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "names" array argument is specified in t.deleteCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "names" argument are expected to be non-empty strings, but the element at index 1 was object.');
                });
        });

        it('Should throw an error if an invalid "urls" argument is specified in t.deleteCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "urls" argument is specified in t.deleteCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "urls" argument is expected to be a string or a string array, but it was number.');
                });
        });

        it('Should throw an error if an invalid "urls" array argument is specified in t.deleteCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "urls" array argument is specified in t.deleteCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "urls" argument are expected to be non-empty strings, but the element at index 1 was object.');
                });
        });
    });
});
