var expect = require('chai').expect;

describe('[TypeScript] Smoke tests', function () {
    it('Should run non-trivial tests', function () {
        return runTests('./testcafe-fixtures/non-trivial-test.ts', null, { selectorTimeout: 5000 });
    });

    it('Should produce correct callsites on error', function () {
        return runTests('./testcafe-fixtures/callsite-test.ts', null, { shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).contains('The specified selector does not match any element in the DOM tree.');
                expect(errs[0]).contains('>  5 |async function doSmthg(selector: string, t: any): Promise<any> { await (<TestController>t).click(selector); }');
            });
    });
});
