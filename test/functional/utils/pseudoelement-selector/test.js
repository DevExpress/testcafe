const createTestCafe = require('../../../..');
const assert = require('assert');

describe('Actions with pseudoelement selectors', () => {
    it('Should work', async function () {
        this.timeout(30000);

        let runner;
        let testcafe;

        return await createTestCafe('localhost', '', '')
            .then(testcafeInstance => {
                runner = testcafeInstance.createRunner();
                testcafe = testcafeInstance;
            })
            .then(() => {
                return runner
                    .src('test/functional/utils/pseudoelement-selector/testcafe-fixture.js')
                    .browsers('chrome')
                    .run();
            })
            .then(async testResult => {
                assert.deepStrictEqual(testResult, 0);
                await testcafe.close();
            });
    });
});
