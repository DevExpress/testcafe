describe('[Regression](GH-1140)', function () {
    it('Test should not hang while iframe is reloaded and it is not under cursor', function () {
        // NOTE: we set selectorTimeout to a large value to wait for an iframe to load
        // on the farm (it is fast locally but can take some time on the farm)
        return runTests('testcafe-fixtures/index.test.js', 'Perform an action after iframe reloaded', { selectorTimeout: 10000 });
    });
});
