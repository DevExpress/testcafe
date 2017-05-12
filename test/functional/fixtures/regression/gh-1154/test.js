describe('[Regression](GH-1154)', function () {
    it('iframe driver should run an action only if content document is ready', function () {
        // NOTE: we set selectorTimeout to a large value to wait for an iframe to load
        // on the farm (it is fast locally but can take some time on the farm)
        return runTests('testcafe-fixtures/index.test.js', 'Perform an action in iframe', { selectorTimeout: 10000 });
    });
});
