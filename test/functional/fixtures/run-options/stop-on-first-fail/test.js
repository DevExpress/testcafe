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
