const path           = require('path');
const createTestCafe = require('../../../../../../lib');

let testCafe = null;

const runTests = (testName) => {
    if (!testCafe)
        throw new Error('"testCafe" isn\'t defined');

    const runner = testCafe.createRunner();

    return runner
        .filter(test => {
            return testName ? test === testName : true;
        })
        .run();
};

describe('[API] fixture global before/after hooks', () => {
    before(async () => {
        testCafe = await createTestCafe({ configFile: path.resolve('./test/functional/fixtures/api/es-next/global-hooks/data/fixture-config.js') });
    });

    after(function () {
        this.timeout(60000);

        testCafe.close();
    });

    beforeEach(() => {
        global.fixtureBefore = 0;
        global.fixtureAfter  = 0;
    });

    afterEach(() => {
        delete global.fixtureBefore;
        delete global.fixtureAfter;
    });

    it('Should run hooks for all fixture', async () => {
        return runTests('Test1');
    });

    it('Should run all hooks for fixture', async () => {
        return runTests('Test2');
    });

    it('Should run hooks in the right order', async () => {
        return runTests('Test3');
    });
});

describe('[API] test global before/after hooks', () => {
    before(async () => {
        testCafe = await createTestCafe({ configFile: path.resolve('./test/functional/fixtures/api/es-next/global-hooks/data/test-config.js') });
    });

    after(function () {
        this.timeout(60000);

        testCafe.close();
    });

    it('Should run global hooks for all tests', () => {
        return runTests('Test1');
    });
});
