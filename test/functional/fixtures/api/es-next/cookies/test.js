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
                    expect(errs[0]).contains('> 114 |    await t.getCookies({});');
                });
        });

        it('Should throw an error if a "cookie" argument contains invalid cookie array elements in t.getCookies(cookie)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if a "cookie" argument contains invalid cookie array elements in t.getCookies(cookie)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "cookie" argument are expected to be cookie-like objects, but the element at index 1 wasn\'t.');
                    expect(errs[0]).contains('> 128 |        await t.getCookies([validCookies[0], {}, validCookies[1], validCookies[2], validCookies[3]]);');
                });
        });

        it('Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.getCookies(...cookies)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.getCookies(...cookies)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "cookie" argument at position 2 is expected to be a cookie-like object or a cookie-like object array.');
                    expect(errs[0]).contains('> 142 |        await t.getCookies([validCookies[0], validCookies[1]], validCookies[2], {}, validCookies[3]);');
                });
        });

        it('Should throw an error if invalid "...cookies" arguments are specified in t.getCookies(...cookies)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if invalid "...cookies" arguments are specified in t.getCookies(...cookies)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The elements of the "cookie" argument at position 2 are expected to be cookie-like objects, but the element at index 1 wasn\'t.');
                    expect(errs[0]).contains('> 156 |        await t.getCookies(validCookies[0], [validCookies[1]], [validCookies[2], {}, validCookies[3]]);');
                });
        });

        it('Should throw an error if an invalid "names" argument is specified in t.getCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "names" argument is specified in t.getCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "names" argument is expected to be a string or a string array, but it was number.');
                    expect(errs[0]).contains("> 160 |    await t.getCookies(1, 'https://valid-url.com');");
                });
        });

        it('Should throw an error if an invalid "names" array argument is specified in t.getCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "names" array argument is specified in t.getCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "names" argument are expected to be non-empty strings, but the element at index 1 was object.');
                    expect(errs[0]).contains("> 164 |    await t.getCookies(['validCookieName', {}], 'https://valid-url.com');");
                });
        });

        it('Should throw an error if an invalid "urls" argument is specified in t.getCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "urls" argument is specified in t.getCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "urls" argument is expected to be a string or a string array, but it was number.');
                    expect(errs[0]).contains("> 168 |    await t.getCookies(['validCookieName1', 'validCookieName2'], 1);");
                });
        });

        it('Should throw an error if an invalid "urls" array argument is specified in t.getCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "urls" array argument is specified in t.getCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "urls" argument are expected to be non-empty strings, but the element at index 1 was object.');
                    expect(errs[0]).contains("> 172 |    await t.getCookies(['validCookieName1', 'validCookieName2'], ['https://valid-url.com', {}]);");
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
                    expect(errs[0]).contains('> 218 |    await t.setCookies({});');
                });
        });

        it('Should throw an error if a "cookie" argument contains invalid cookie array elements in t.setCookies(cookie)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if a "cookie" argument contains invalid cookie array elements in t.setCookies(cookie)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "cookie" argument are expected to be cookie-like objects, but the element at index 1 wasn\'t.');
                    expect(errs[0]).contains('> 232 |        await t.setCookies([validCookies[0], {}, validCookies[1], validCookies[2], validCookies[3]]);');
                });
        });

        it('Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.setCookies(...cookies)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.setCookies(...cookies)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "cookie" argument at position 2 is expected to be a cookie-like object or a cookie-like object array.');
                    expect(errs[0]).contains('> 246 |        await t.setCookies([validCookies[0], validCookies[1]], validCookies[2], {}, validCookies[3]);');
                });
        });

        it('Should throw an error if invalid "...cookies" arguments are specified in t.setCookies(...cookies)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if invalid "...cookies" arguments are specified in t.setCookies(...cookies)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The elements of the "cookie" argument at position 2 are expected to be cookie-like objects, but the element at index 1 wasn\'t.');
                    expect(errs[0]).contains('> 260 |        await t.setCookies(validCookies[0], [validCookies[1]], [validCookies[2], {}, validCookies[3]]);');
                });
        });

        it('Should throw an error if an invalid "nameValueObjects" argument is specified in t.setCookies(nameValueObjects, url)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "nameValueObjects" argument is specified in t.setCookies(nameValueObjects, url)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "nameValueObjects" argument is expected to be a name-value object or a name-value object array.');
                    expect(errs[0]).contains("> 264 |    await t.setCookies({ someCookieName: 'value', unexpectedAdditionalProp: 'value' }, 'https://domain.com');");
                });
        });

        it('Should throw an error if an invalid "nameValueObjects" array argument is specified in t.setCookies(nameValueObjects, url)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "nameValueObjects" array argument is specified in t.setCookies(nameValueObjects, url)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "nameValueObjects" argument are expected to be name-value objects, but the element at index 1 wasn\'t.');
                    expect(errs[0]).contains("> 269 |        .setCookies([{ 'validCookie': 'value' }, { someCookieName: 'value', unexpectedAdditionalProp: 'value' }], 'https://domain.com');");
                });
        });

        it('Should throw an error if the required "url" argument is not specified in t.setCookies(nameValueObjects, url)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if the required "url" argument is not specified in t.setCookies(nameValueObjects, url)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "url" argument is required if the "nameValueObjects" argument is specified.');
                    expect(errs[0]).contains("> 274 |        .setCookies({ 'validCookie': 'value' });");
                });
        });

        it('Should throw an error if no parameters are specified in t.setCookies()', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if no parameters are specified in t.setCookies()')
                .catch(function (errs) {
                    expect(errs[0]).contains('Required arguments ("cookies" or a pair of "nameValueObjects" and "url") are missed.');
                    expect(errs[0]).contains('> 278 |    await t.setCookies();');
                });
        });

        it('Should throw an error if an "url" argument has a wrong type in t.setCookies(nameValueObjects, url)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an "url" argument has a wrong type in t.setCookies(nameValueObjects, url)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "url" argument is expected to be a non-empty string, but it was object.');
                    expect(errs[0]).contains("> 282 |    await t.setCookies({ 'validCookie': 'value' }, {});");
                });
        });

        it('Should throw an error if an empty string is set as the "url" argument in t.setCookies(nameValueObjects, url)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an empty string is set as the "url" argument in t.setCookies(nameValueObjects, url)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "url" argument is expected to be a non-empty string, but it was ""');
                    expect(errs[0]).contains("> 286 |    await t.setCookies({ 'validCookie': 'value' }, '');");
                });
        });

        it('Should throw an error if an "url" argument is represented by invalid URL string (t.setCookies(nameValueObjects, url))', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if a protocol part of the "url" argument cannot be parsed (t.setCookies(nameValueObjects, url))')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "url" argument is expected to be an URL, but it was not a valid URL.');
                    expect(errs[0]).contains("> 290 |    await t.setCookies({ 'validCookie': 'value' }, '1');");
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
                    expect(errs[0]).contains('> 408 |    await t.deleteCookies({});');
                });
        });

        it('Should throw an error if a "cookie" argument contains invalid cookie array elements in t.deleteCookies(cookie)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if a "cookie" argument contains invalid cookie array elements in t.deleteCookies(cookie)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "cookie" argument are expected to be cookie-like objects, but the element at index 1 wasn\'t.');
                    expect(errs[0]).contains('> 422 |        await t.deleteCookies([validCookies[0], {}, validCookies[1], validCookies[2], validCookies[3]]);');
                });
        });

        it('Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.deleteCookies(...cookies)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if "...cookies" arguments contain invalid cookie array elements in t.deleteCookies(...cookies)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "cookie" argument at position 2 is expected to be a cookie-like object or a cookie-like object array.');
                    expect(errs[0]).contains('> 436 |        await t.deleteCookies([validCookies[0], validCookies[1]], validCookies[2], {}, validCookies[3]);');
                });
        });

        it('Should throw an error if invalid "...cookies" arguments are specified in t.deleteCookies(...cookies)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if invalid "...cookies" arguments are specified in t.deleteCookies(...cookies)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The elements of the "cookie" argument at position 2 are expected to be cookie-like objects, but the element at index 1 wasn\'t.');
                    expect(errs[0]).contains('> 450 |        await t.deleteCookies(validCookies[0], [validCookies[1]], [validCookies[2], {}, validCookies[3]]);');
                });
        });

        it('Should throw an error if an invalid "names" argument is specified in t.deleteCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "names" argument is specified in t.deleteCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "names" argument is expected to be a string or a string array, but it was number.');
                    expect(errs[0]).contains("> 454 |    await t.deleteCookies(1, 'https://valid-url.com');");
                });
        });

        it('Should throw an error if an invalid "names" array argument is specified in t.deleteCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "names" array argument is specified in t.deleteCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "names" argument are expected to be non-empty strings, but the element at index 1 was object.');
                    expect(errs[0]).contains("> 458 |    await t.deleteCookies(['validCookieName', {}], 'https://valid-url.com');");
                });
        });

        it('Should throw an error if an invalid "urls" argument is specified in t.deleteCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "urls" argument is specified in t.deleteCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('The "urls" argument is expected to be a string or a string array, but it was number.');
                    expect(errs[0]).contains("> 462 |    await t.deleteCookies(['validCookieName1', 'validCookieName2'], 1);");
                });
        });

        it('Should throw an error if an invalid "urls" array argument is specified in t.deleteCookies(names, urls)', function () {
            return runTests('./testcafe-fixtures/cookies-test.js', 'Should throw an error if an invalid "urls" array argument is specified in t.deleteCookies(names, urls)')
                .catch(function (errs) {
                    expect(errs[0]).contains('Elements of the "urls" argument are expected to be non-empty strings, but the element at index 1 was object.');
                    expect(errs[0]).contains("> 466 |    await t.deleteCookies(['validCookieName1', 'validCookieName2'], ['https://valid-url.com', {}]);");
                });
        });
    });
});
