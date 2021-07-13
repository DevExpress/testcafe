const proxyquire = require('proxyquire');

const SessionControllerStub = {
    getSession: () => {
        return { id: 'sessionId' };
    },
};

const getBrowserStub = () => {
    return {
        parsedUserAgent: {},
        alias:           'browser-mock',
        headless:        false,
    };
};

const TestRun = proxyquire('../../../lib/test-run/index', {
    './session-controller': SessionControllerStub,
    '../utils/get-browser': getBrowserStub,
});

class BaseTestRunMock extends TestRun {
    constructor (init = {}) {
        init = Object.assign({
            test:               {},
            browserConnection:  {},
            screenshotCapturer: {},
            globalWarningLog:   {},
            opts:               {},
        }, init);

        super(init);
    }

    _addInjectables () {}

    _initRequestHooks () {}

    get id () {
        return 'id';
    }
}

module.exports = BaseTestRunMock;

