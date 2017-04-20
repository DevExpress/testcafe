describe('[Regression](GH-1327)', function () {
    describe('Typing in non-text input elements', function () {
        it('Should type value', function () {
            return runTests('testcafe-fixtures/index.test.js', 'Type value');
        });

        it('Should type value with caret position', function () {
            return runTests('testcafe-fixtures/index.test.js', 'Type value with caret position');
        });

        it('Should type value with "replace" true', function () {
            return runTests('testcafe-fixtures/index.test.js', 'Type value with replace');
        });
    });
});
