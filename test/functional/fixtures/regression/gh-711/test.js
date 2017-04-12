describe('[Regression](GH-711) Should pass if typing executed in contentEditable body', function () {
    it('Should pass for typing in contentEditable body', function () {
        return runTests('testcafe-fixtures/typing-in-content-editable-test.js', 'Typing in contentEditable body');
    });

    it('Should pass for typing in contentEditable body with not-contentEditable children', function () {
        return runTests('testcafe-fixtures/typing-in-content-editable-test.js', 'Typing in contentEditable body with not-contentEditable children');
    });
});
