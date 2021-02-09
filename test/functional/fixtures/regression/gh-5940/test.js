describe('[Regression](GH-993)', function () {
    it("Key events should have the 'key' or 'keyIdentifier' property when t.pressKey('enter') is performed", function () {
        return runTests('testcafe-fixtures/index.test.js', 'Press the "Enter" key');
    });
});
