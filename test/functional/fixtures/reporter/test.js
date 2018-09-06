const expect               = require('chai').expect;
const { createTestStream, createAsyncTestStream } = require('../../utils/stream');

describe('Reporter', () => {
    it('Should support several different reporters for a test run', function () {
        const stream1 = createTestStream();
        const stream2 = createTestStream();

        return runTests('testcafe-fixtures/index-test.js', 'Simple test', {
            only:      ['chrome'],
            reporters: [
                {
                    reporter:  'json',
                    outStream: stream1
                },
                {
                    reporter:  'list',
                    outStream: stream2
                }
            ]
        })
            .then(() => {
                expect(stream1.data).to.contains('Chrome');
                expect(stream1.data).to.contains('Reporter');
                expect(stream1.data).to.contains('Simple test');
                expect(stream2.data).to.contains('Chrome');
                expect(stream2.data).to.contains('Reporter');
                expect(stream2.data).to.contains('Simple test');
            });
    });

    it('Should wait until reporter stream is finished (GH-2502)', function () {
        const stream = createAsyncTestStream();

        const runOpts = {
            only:      ['chrome'],
            reporters: [
                {
                    reporter:  'json',
                    outStream: stream
                }
            ]
        };

        return runTests('testcafe-fixtures/index-test.js', 'Simple test', runOpts)
            .then(() => {
                expect(stream.finalCalled).to.be.ok;
            });
    });

    it('Should wait until reporter stream failed to finish (GH-2502)', function () {
        const stream = createAsyncTestStream({ shouldFail: true });

        const runOpts = {
            only:      ['chrome'],
            reporters: [
                {
                    reporter:  'json',
                    outStream: stream
                }
            ]
        };

        return runTests('testcafe-fixtures/index-test.js', 'Simple test', runOpts)
            .then(() => {
                expect(stream.finalCalled).to.be.ok;
            });
    });
});
