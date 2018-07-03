describe('[Regression](GH-2056)', function () {
    it('Move actions should provide correct button, buttons, which properties. Chrome', function () {
        return runTests('testcafe-fixtures/index.js', 'Chrome', { only: ['chrome', 'chrome-osx'] });
    });

    it('Move actions should provide correct button, buttons, which properties. IE, FF, Edge', function () {
        return runTests('testcafe-fixtures/index.js', 'IE, FF, Edge', { skip: ['iphone', 'ipad', 'android', 'chrome', 'chrome-osx'] });
    });
});
