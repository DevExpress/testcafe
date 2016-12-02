describe('[Regression](GH-993)', function () {
    it("Key events should have 'key' or 'keyIdentifier' properties when t.pressKey('enter') performed", function () {
        return runTests('testcafe-fixtures/index.test.js', 'Press the "enter" key on the input');
    });
});
