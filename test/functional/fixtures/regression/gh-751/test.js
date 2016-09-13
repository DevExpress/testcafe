describe('[Regression](GH-751) Should not add unnecessary timeouts between actions', function () {
    it('Should be any delay between mouseup, click and dblclick events', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Test dblclick performance', { only: 'chrome' });
    });

    it('Should not add an additional before delay mouseup if it mousedown handlers worked for a long time', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Test click performance with hard work', { only: 'chrome' });
    });
});
