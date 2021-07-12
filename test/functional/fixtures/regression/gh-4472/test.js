describe('[Regression](GH-4472)', function () {
    it('Input should not lose focus after the focus method was called on a not focusable element', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});
