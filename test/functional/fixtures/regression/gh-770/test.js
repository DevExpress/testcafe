describe('[Regression](GH-770)', function () {
    it("Shouldn't focus on non-focusable element while clicking", function () {
        return runTests('./testcafe-fixtures/index.test.js', 'click non-focusable div');
    });

    it('The element should remain active in IE if it has been focused while mousedown executed', function () {
        return runTests('testcafe-fixtures/index.test.js', 'Click on div', { only: ['ie', 'ie 9', 'ie 10', 'edge'] });
    });
});
