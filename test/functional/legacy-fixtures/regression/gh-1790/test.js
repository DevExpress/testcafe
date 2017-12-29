var expect = require('chai').expect;

describe('[Regression](GH-1790) The Type action should not hang if element is not in the viewport', function () {
    it('gh-1790', function () {
        return runTests('testcafe-fixtures/index.test.js', 'gh-1790', { only: ['chrome'], shouldFail: true })
            .catch(function (errs) {
                expect(errs[0]).to.contain('A target element <input id="input"> of the type action is not visible');
            });
    });
});
