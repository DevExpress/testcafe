describe('[Regression](GH-6545)', function () {
    it('HTML elements inside an iframe must have HTMLElement and Object type of iframe window', function () {
        return runTests('testcafe-fixtures/index.js', null, { only: 'chrome' });
    });
});


