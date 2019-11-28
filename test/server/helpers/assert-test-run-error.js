const expect           = require('chai').expect;
const { escapeRegExp } = require('lodash');
const read             = require('read-file-relative').readSync;

const { createSimpleTestStream }     = require('../../functional/utils/stream');
const ReporterPluginHost             = require('../../../lib/reporter/plugin-host');
const TestRunErrorFormattableAdapter = require('../../../lib/errors/test-run/formattable-adapter');
const TEST_RUN_PHASE                 = require('../../../lib/test-run/phase');
const testCallsite                   = require('../data/test-callsite');

const SCREENSHOT_PATH          = '/unix/path/with/<tag>';
const USER_AGENT_MOCK          = 'Chrome 15.0.874.120 / macOS 10.15';
const TESTCAFE_CALLSITE_PATH   = require.resolve('../data/test-callsite');
const TEST_FILE_STACK_ENTRY_RE = new RegExp('\\s*\\n?\\(' + escapeRegExp(TESTCAFE_CALLSITE_PATH), 'g');

module.exports = function assertTestRunError (err, expectedFileName, setCallsite = true) {
    const outStreamMock = createSimpleTestStream();
    const plugin        = new ReporterPluginHost({}, outStreamMock);

    const errAdapter = new TestRunErrorFormattableAdapter(err, {
        userAgent:      USER_AGENT_MOCK,
        screenshotPath: SCREENSHOT_PATH,
        testRunPhase:   TEST_RUN_PHASE.initial,
        callsite:       setCallsite ? testCallsite : null
    });

    plugin
        .useWordWrap(true)
        .write(plugin.formatError(errAdapter));

    const actual = outStreamMock.data.replace(TEST_FILE_STACK_ENTRY_RE, ' (testfile.js');

    const expectedMsg = read(expectedFileName)
        .replace(/(\r\n)/gm, '\n')
        .trim();

    expect(actual).eql(expectedMsg);
};
