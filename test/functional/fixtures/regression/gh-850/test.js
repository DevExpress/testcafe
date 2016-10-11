describe('[Regression](GH-850)', function () {
    it('Should resume the test if the cursor is moving from reloaded iframe to top window', function () {
        // NOTE: we set selectorTimeout to a large value to wait for an iframe to load
        // on the farm (it is fast locally but can take some time on the farm)
        return runTests('testcafe-fixtures/index.test.js', 'Move from reloaded iframe', { selectorTimeout: 10000 });
    });
});
