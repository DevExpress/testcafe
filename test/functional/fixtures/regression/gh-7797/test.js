describe('[Regression](GH-7797)', function () {
    it('Should click element if it\'s overlapped by StatusBar', function () {
        return runTests('testcafe-fixtures/index.js');
    });
});


