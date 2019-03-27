const expect = require('chai').expect;

describe('[TypeScript] Smoke tests', function () {
    // TODO: IMPORTANT: Azure test tasks hang when a role is used in a test, fix it immediately
    it('Should run non-trivial tests', function () {
        return runTests('./testcafe-fixtures/non-trivial-test.ts', null, { skip: ['safari', 'chrome-osx', 'firefox-osx', 'ipad', 'iphone'], selectorTimeout: 5000 });
    });

    it('Should produce correct callsites on error', function () {
        return runTests('./testcafe-fixtures/callsite-test.ts', null, { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains(
                    'The specified selector does not match any element in the DOM tree.' +
                    '  > | Selector(\'#heyheyhey\')'
                );
                expect(errs[0]).contains('>  5 |async function doSmthg(selector: string, t: any): Promise<any> { await (<TestController>t).click(selector); }');
            });
    });
});
