const { expect } = require('chai');
const path       = require('path');

describe('[API] Test Info', () => {
    it('Should pass correct test and fixture info to fixture hooks', () => {
        return runTests('./testcafe-fixtures/fixture-hooks.js', 'Fixture hooks');
    });
    it('Should pass correct test and fixture info to test and its hooks', () => {
        return runTests('./testcafe-fixtures/test-hooks.js', 'Test hooks');
    });
    it('Should pass correct test and fixture info to runner hooks', () => {
        const fixtureInfo = {
            name: 'FixtureName2',
            meta: { fixtureMeta: 'v' },
            path: path.resolve('./test/functional/fixtures/api/es-next/test-info/testcafe-fixtures/runner-hooks.js'),
        };
        const testInfo    = {
            name: 'Runner hooks',
            meta: { testMeta: 'v' },
        };

        const expectFixtureHookInfo = (_, info) => expect(info).eql(fixtureInfo);
        const expectTestHookInfo    = async t => await t.expect(t.fixture).eql(fixtureInfo).expect(t.test).eql(testInfo);

        return runTests('./testcafe-fixtures/runner-hooks.js', 'Runner hooks', {
            hooks: {
                fixture: {
                    before: expectFixtureHookInfo,
                    after:  expectFixtureHookInfo,
                },
                test: {
                    before: expectTestHookInfo,
                    after:  expectTestHookInfo,
                },
            },
        });
    });
});
