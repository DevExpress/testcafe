describe('[Regression](GH-2069) - scroll to fully visible element', function () {
    it('Should not scroll parent container if target element is already fully visible', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


