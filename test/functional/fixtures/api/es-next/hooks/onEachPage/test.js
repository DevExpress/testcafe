var expect = require('chai').expect;

describe('[API] fixture.onEachPage hook', function () {
    it('Should run "fixture.onEachPage" and resume test execution', function () {
        return runTests('./testcafe-fixtures/on-each-page.test.js', 'Run "fixture.onEachPage" hook and continue test', { only: 'chrome' });
    });

    it('Should break test and run "fixture.afterEach" if hook failed', function () {
        return runTests('./testcafe-fixtures/on-each-page.test.js', 'Break test and run "fixture.afterEach" if hook failed', {
            only:       'chrome',
            shouldFail: true
        }).catch(function (errs) {
            expect(errs[0]).to.contains(
                ' 40 |fixture `Break test and run "fixture.afterEach" if hook failed`' +
                ' 41 |    .page `${testPage}`' +
                ' 42 |    .onEachPage(() => {' +
                " > 43 |        throw new Error('Yo!');" +
                ' 44 |    })'
            );

            expect(errs[1]).to.contains(
                ' 44 |    })' +
                ' 45 |    .afterEach(() => {' +
                " > 46 |        throw new Error('Yo!');" +
                ' 47 |    });' +
                ' 48 |' +
                " 49 |test('Break test and run \"fixture.afterEach\" if hook failed', async t => {"
            );
        });
    });

    it('Should switch hook context window with test', function () {
        // NOTE: we set selectorTimeout to a large value to wait for an iframe to load
        // on the farm (it is fast locally but can take some time on the farm)

        return runTests('./testcafe-fixtures/on-each-page.test.js', 'Run hook in the current window context', {
            only:            'chrome',
            selectorTimeout: 10000
        });
    });

    it('Should restart hook if page reloaded during its execution', function () {
        return runTests('./testcafe-fixtures/on-each-page.test.js', 'Restart hook if reload occurs during its execution', { only: 'chrome' });
    });

    it('Should run hook in "fixture.beforeEach" and "fixture.afterEach"', function () {
        return runTests('./testcafe-fixtures/on-each-page.test.js', 'Run "fixture.beforeEach" and "fixture.afterEach"', { only: 'chrome' });
    });

    it('Should share t.ctx and t.fixtureCtx between test and hooks', function () {
        return runTests('./testcafe-fixtures/on-each-page.test.js', 'Share t.ctx and t.fixtureCtx between test and hooks', { only: 'chrome' });
    });

    it('Should switch hook after command "t.wait" is executed', function () {
        return runTests('./testcafe-fixtures/on-each-page.test.js', 'Switch hook after command "t.wait" is executed', { only: 'chrome' });
    });
});

describe('[API] test.onEachPage hook', function () {
    it('Should run hook for "test.onEachPage"', function () {
        return runTests('./testcafe-fixtures/on-each-page.test.js', 'Run "test.onEachPage" hook', { only: 'chrome' });
    });

    it('Should override "fixture.onEachPage"', function () {
        return runTests('./testcafe-fixtures/on-each-page.test.js', 'Override "fixture.onEachPage"', { only: 'chrome' });
    });
});

describe('[API] t.onEachPage hook', function () {
    it('Should run hook for test controller', function () {
        return runTests('./testcafe-fixtures/on-each-page.test.js', 'Hook for test controller', { only: 'chrome' });
    });

    it('Should override "fixture.onEachPage" and "test.onEachPage" if it present', function () {
        return runTests('./testcafe-fixtures/on-each-page.test.js', 'Override "fixture.onEachPage" and "test.onEachPage', { only: 'chrome' });
    });
});
