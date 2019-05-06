const proxyquire = require('proxyquire');
const { expect } = require('chai');


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
            debug: debugMock
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

        expect(debugMock.data['testcafe:test-run:Chrome:command'].replace(/\s/g, '')).equal(
            '{data2:{data1:[Circular]}}'
        );

        expect(debugMock.data['testcafe:test-run:Chrome:driver-message'].replace(/\s/g, '')).equal(
            '{data2:{data1:[Circular]}}'
        );
    });

    it('Should not throw if data inspection fails', () => {
        const TestRunDebugLog = proxyquire('../../lib/test-run/debug-log', {
            debug: debugMock,

            util: {
                inspect () {
                    throw new Error('inspect error');
                }
            }
        });

        const debugLog = new TestRunDebugLog('Chrome');

        debugLog.command({});
        debugLog.driverMessage({});

        expect(debugMock.data['testcafe:test-run:Chrome:command']).contain('inspect error');
        expect(debugMock.data['testcafe:test-run:Chrome:command']).match(/at .*inspect/);

        expect(debugMock.data['testcafe:test-run:Chrome:driver-message']).contain('inspect error');
        expect(debugMock.data['testcafe:test-run:Chrome:driver-message']).match(/at .*inspect/);
    });
});
