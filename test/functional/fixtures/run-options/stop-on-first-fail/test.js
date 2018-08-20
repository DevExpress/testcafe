const expect               = require('chai').expect;
const fs                   = require('fs');
const { createTestStream } = require('../../../utils/stream');

const TEST_RUN_COUNT_FILENAME = 'testRunCount.txt';

const getTestRunCount = () => {
    const content = fs.readFileSync(TEST_RUN_COUNT_FILENAME).toString();

    return parseInt(content, 10);
};

describe('Stop test task on first failed test', () => {
    afterEach(() => {
        fs.unlinkSync(TEST_RUN_COUNT_FILENAME);
    });

    it('Basic', () => {
        return runTests('./testcafe-fixtures/stop-on-first-fail-test.js', void 0, { shouldFail: true, stopOnFirstFail: true })
            .catch(() => {
                expect(getTestRunCount()).eql(2);
                expect(testReport.failedCount).eql(1);
            });
    });

    it('Reporting', () => {
        const stream = createTestStream();

        return runTests('./testcafe-fixtures/stop-on-first-fail-test.js', void 0, {
            stopOnFirstFail: true,
            reporters:       [{
                reporter:  'spec',
                outStream: stream
            }]
        }).then(() => {
            expect(stream.data).contains('√ test1');
            expect(stream.data).contains('× test2');
            expect(stream.data).to.not.contains('√ test3');
        });
    });
});
