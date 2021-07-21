const proxyquire = require('proxyquire');
const { expect } = require('chai');
const semver     = require('semver');

describe('Debug Log', () => {
    function debugMock (id) {
        if (!debugMock.data)
            debugMock.data = {};

        if (!debugMock.data[id])
            debugMock.data[id] = '';

        return newData => {
            debugMock.data[id] += newData;
        };
    }

    beforeEach(() => {
        debugMock.data = null;
    });

    it('Should not throw an error when data contains circular references', () => {
        const TestRunDebugLog = proxyquire('../../lib/test-run/debug-log', {
            debug: debugMock,
        });

        const debugLog = new TestRunDebugLog('Chrome');

        const data1 = {};
        const data2 = {};

        data1.data2 = data2;
        data2.data1 = data1;

        debugLog.command(data1);
        debugLog.driverMessage(data1);

        delete data1.data2;
        delete data2.data1;

        const expectedCommandValue       = semver.gte(process.version, '13.0.0') ? '<ref*1>{data2:{data1:[Circular*1]}}' : '{data2:{data1:[Circular]}}';
        const expectedDriverMessageValue = semver.gte(process.version, '13.0.0') ? '<ref*1>{data2:{data1:[Circular*1]}}' : '{data2:{data1:[Circular]}}';

        expect(debugMock.data['testcafe:test-run:Chrome:command'].replace(/\s/g, '')).equal(expectedCommandValue);
        expect(debugMock.data['testcafe:test-run:Chrome:driver-message'].replace(/\s/g, '')).equal(expectedDriverMessageValue);
    });

    it('Should not throw if data inspection fails', () => {
        const logEntry = proxyquire('../../lib/utils/log-entry', {
            util: {
                inspect () {
                    throw new Error('inspect error');
                },
            },
        });

        logEntry(debugMock, {});

        const debugData = Object.keys(debugMock.data)[0];

        expect(debugData).contain('inspect error');
        expect(debugData).match(/at .*inspect/);
    });
});
