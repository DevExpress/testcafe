describe('[Regression](GH-1424)', function () {
    it('Should raise click event on a button after "enter" key is pressed', function () {
        // TODO: fix it for Firefox with macOS
        return runTests('testcafe-fixtures/index-test.js', 'Press enter', { skip: ['firefox-osx'] });
    });
});
