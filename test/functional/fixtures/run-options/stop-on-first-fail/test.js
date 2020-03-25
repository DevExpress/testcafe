const expect                     = require('chai').expect;
const fs                         = require('fs');
const { createSimpleTestStream } = require('../../../utils/stream');
const ReporterPluginHost         = require('../../../../../lib/reporter/plugin-host');

const TEST_RUN_COUNT_FILENAME = 'testRunCount.txt';

const getTestRunCount = () => {
    const content = fs.readFileSync(TEST_RUN_COUNT_FILENAME).toString();

    return parseInt(content, 10);
};

describe('Stop test task on first failed test', () => {
    afterEach(() => {
        // NOTE: after mocha is updated to `^7.1.1` the `afterEach` hook is called if the test is skipped/pending
        // before the update the `afterEach` hook was not called.
        // When we run the test not in `chrome` the file will not exist, since we have the { only: 'chrome' } option,
        // so we cannot unlink it.
        if (fs.existsSync(TEST_RUN_COUNT_FILENAME))
            fs.unlinkSync(TEST_RUN_COUNT_FILENAME);
    });

    it('Basic', () => {
        return runTests('./testcafe-fixtures/stop-on-first-fail-test.js', void 0, {
            shouldFail:      true,
            stopOnFirstFail: true,
            only:            'chrome'
        }).catch(() => {
            expect(getTestRunCount()).eql(2);
            expect(testReport.failedCount).eql(1);
        });
    });

    it('Reporting', () => {
        const stream = createSimpleTestStream();

        return runTests('./testcafe-fixtures/stop-on-first-fail-test.js', void 0, {
            shouldFail:      true,
            stopOnFirstFail: true,
            reporter:        [{
                name:   'spec',
                output: stream
            }]
        }).catch(() => {
            const pluginHost  = new ReporterPluginHost({ noColors: true });
            const { ok, err } = pluginHost.symbols;

            expect(stream.data).contains(`${ok} test1`);
            expect(stream.data).contains(`${err} test2`);
            expect(stream.data).to.not.contains(`${ok} test3`);
            expect(stream.data).contains('2/3 failed');
        });
    });
});
