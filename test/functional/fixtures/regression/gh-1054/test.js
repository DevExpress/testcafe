describe('[Regression](GH-1054)', function () {
    describe('Target element should have the first symbol of typing text when the first input event raised', function () {
        it("Typing in the input element with 'replace' option", function () {
            return runTests('testcafe-fixtures/index.test.js', 'Type text in the textarea');
        });

        it("Typing in the content editable element with 'replace' option", function () {
            return runTests('testcafe-fixtures/index.test.js', 'Type text in the content editable element');
        });
    });
});
