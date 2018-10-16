describe('[Regression](GH-2067) - Radio button navigation by keyboard', function () {
    it('named', function () {
        return runTests('testcafe-fixtures/index.js', 'named');
    });

    it('nonamed - chrome', function () {
        return runTests('testcafe-fixtures/index.js', 'nonamed - chrome', { only: ['chrome', 'chrome-osx'] });
    });

    it('nonamed - ie, firefox', function () {
        return runTests('testcafe-fixtures/index.js', 'nonamed - ie, firefox', { skip: ['chrome', 'chrome-osx', 'android'] });
    });

    it('Should select the checked radio button by pressing the tab key', function () {
        return runTests('testcafe-fixtures/index.js', 'Should select the checked radio button by pressing the tab key');
    });
});
