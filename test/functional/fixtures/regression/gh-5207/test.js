function customReporter () {
    return {
        async reportTaskStart () {
        },
        async reportFixtureStart () {
        },
        async reportTestDone () {
            return new Promise(resolve => {
                setTimeout(resolve, 5000);
            });
        },
        async reportTaskDone () {
        }
    };
}

describe('[Regression](GH-5207)', function () {
    it('Should not hand with `disablePageReloads` and async reporter', function () {
        return runTests('testcafe-fixtures/index.js', null, {
            reporter: customReporter
        });
    });
});


