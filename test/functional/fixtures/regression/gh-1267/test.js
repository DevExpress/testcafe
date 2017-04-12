var expect = require('chai').expect;

describe('[Regression](GH-1267)', function () {
    it('Incorrect callsite stack for failed assertion in a method of some class (GH-1267)', function () {
        return runTests('testcafe-fixtures/index.test.js', null, { only: ['chrome'] })
            .catch(function (errs) {
                expect(errs[0]).to.contains(
                    '  3 |class Page {\n' +
                    '  4 |    async expect (t) {\n' +
                    ' >  5 |        await t.expect(false).ok();\n' +
                    '  6 |    }\n' +
                    '  7 |}\n'
                );
            });
    });
});
