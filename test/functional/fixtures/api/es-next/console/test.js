describe('[API] t.getBrowserConsoleMessages()', function () {
    it('Should return messages from the console', function () {
        return runTests('./testcafe-fixtures/console-test.js', 't.getBrowserConsoleMessages');
    });

    it('Should format messages if several args were passed', function () {
        return runTests('./testcafe-fixtures/console-test.js', 'messages formatting');
    });

    it('Should return empty collections if there are no messages', () => {
        return runTests('./testcafe-fixtures/console-test.js', 'empty collections (GH-4662)');
    });

    it("Should correctly work with a page with overridden 'Object.keys' method (GH-5600)", () => {
        return runTests('./testcafe-fixtures/console-test.js', "page with overridden 'Object.keys' method (GH-5600)");
    });
});
