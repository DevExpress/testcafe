const expect = require('chai').expect;
const fs     = require('fs');

const COUNT_EXECUTED_TESTS_FILENAME = 'countExecutedTests.txt';

const getCountExecutedTests = () => {
    const content = fs.readFileSync(COUNT_EXECUTED_TESTS_FILENAME).toString();

    return parseInt(content, 10);
};

describe('Stop test task on first failed test', () => {
    it('Basic', () => {
        return runTests('./testcafe-fixtures/stop-on-first-fail-test.js', void 0, { shouldFail: true, bail: true })
            .catch(() => {
                expect(getCountExecutedTests()).eql(1);

                fs.unlinkSync(COUNT_EXECUTED_TESTS_FILENAME);
            });
    });

    it.only('Quarantine', () => {
        return runTests('./testcafe-fixtures/stop-on-first-fail-test.js', void 0, { shouldFail: true, bail: true, quarantineMode: true })
            .catch(() => {
                expect(getCountExecutedTests()).eql(2);

                fs.unlinkSync(COUNT_EXECUTED_TESTS_FILENAME);
            });
    });
});
