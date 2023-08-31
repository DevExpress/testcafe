describe('[Regression](GH-2067) - Radio button navigation by keyboard', function () {
    it('named', function () {
        return runTests('testcafe-fixtures/index.js', 'named', { skip: ['firefox-osx'] });
    });

    it('nonamed - chrome', function () {
        return runTests('testcafe-fixtures/index.js', 'nonamed - chrome', { only: ['chrome', 'chrome-osx', 'edge'] });
    });

    it('nonamed - firefox', function () {
        return runTests('testcafe-fixtures/index.js', 'nonamed - firefox', { only: ['firefox'] });
    });

    it('Should select the checked radio button by pressing the tab key', function () {
        return runTests('testcafe-fixtures/index.js', 'Should select the checked radio button by pressing the tab key', { skip: ['firefox-osx'] });
    });
});
