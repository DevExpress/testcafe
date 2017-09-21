describe('[API] t.getConsoleMessages()', function () {
    it('Should return messages from the console', function () {
        return runTests('./testcafe-fixtures/console-test.js', 't.getConsoleMessages');
    });

    it('Should format messages if several args were passed', function () {
        return runTests('./testcafe-fixtures/console-test.js', 'messages formatting');
    });
});
