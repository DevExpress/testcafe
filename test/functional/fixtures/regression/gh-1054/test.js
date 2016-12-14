describe('[Regression](GH-1054)', function () {
    describe('Target element should contain the first symbol of text input when the input event raised at the first time', function () {
        it('Typing in the input element with "replace" option', function () {
            return runTests('testcafe-fixtures/index.test.js', 'Type text in the input');
        });

        it('Typing in the content editable element with "replace" option', function () {
            return runTests('testcafe-fixtures/index.test.js', 'Type text in the content editable element');
        });
    });
});
