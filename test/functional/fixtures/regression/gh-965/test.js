var expect = require('chai').expect;


describe('[Regression](GH-965)', function () {
    describe('Should throw an error if test page url protocol matches /http.*/', function () {
        it('in navigateTo', function () {
            return runTests('testcafe-fixtures/navigate-to-test.js', 'navigateTo', {
                only:       'chrome',
                shouldFail: true
            })
                .catch(function (errs) {
                    expect(errs[0]).contains('httpss://example.com" test page URL uses an unsupported httpss:// protocol. Only relative URLs or absolute URLs with http://, https:// and file:// protocols are supported.');
                    expect(errs[0]).contains('> 4 |    await t.navigateTo(\'httpss://example.com\');');
                });
        });

        it('in test page', function () {
            return runTests('testcafe-fixtures/test-page.js', 'test.page', {
                only:       'chrome',
                shouldFail: true
            })
                .catch(function (err) {
                    expect(err.message).contains('The specified "httpss://example.com" test page URL uses an unsupported httpss:// protocol. Only relative URLs or absolute URLs with http://, https:// and file:// protocols are supported.');
                    expect(err.stack).contains('> 4 |    .page `httpss://example.com`');
                });
        });
    });
});
