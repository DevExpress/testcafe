describe('[Regression](GH-2015)', function () {
    // TODO: IMPORTANT: Azure test tasks hang when a role is used in a test, fix it immediately
    it('Should restore local storage correctly on UseRole with PreserveUrl', function () {
        return runTests('./testcafe-fixtures/index.js', '', { skip: ['safari', 'chrome-osx', 'firefox-osx', 'ipad', 'iphone'] });
    });
});


