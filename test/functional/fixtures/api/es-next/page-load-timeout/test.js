describe('Should wait for the window.load event if necessary', function () {
    it('Should wait for the window.load event if there are user event handlers for it (set timeout via an option)', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Wait for window.load (set timeout via an option)', { pageLoadTimeout: 3000 });
    });

    it('Should wait for the window.load event if there are user event handlers for it (set timeout via `t`)', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Wait for window.load (set timeout via `t`)', { pageLoadTimeout: 0 });
    });

    it('Should wait for the window.load event in iframe', function () {
        return runTests('testcafe-fixtures/index-test.js', 'Wait for window.load in iframe', {
            pageLoadTimeout: 0,
            selectorTimeout: 10000
        });
    });

    it("Shouldn't wait for the window.load event more than timeout", function () {
        return runTests('testcafe-fixtures/index-test.js', "Don't wait for window.load more than timeout", { pageLoadTimeout: 0 });
    });

    it("Shouldn't wait for the window.load event if there are no user event handlers for it", function () {
        return runTests('testcafe-fixtures/index-test.js', "Don't wait for window.load", { pageLoadTimeout: 10000 });
    });
});
