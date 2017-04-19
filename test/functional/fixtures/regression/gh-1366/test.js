describe('[Regression](GH-1366)', function () {
    it('Should update select element value before emitting input event', function () {
        return runTests('testcafe-fixtures/index-test.js', 'choose value', { skip: 'ie,edge' });
    });
});
