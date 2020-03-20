const TestRun = require('../../../lib/test-run');

module.exports = class TestRunMock extends TestRun {
    constructor (expectedError) {
        super({ id: 'test_id', name: 'test_name', fixture: { path: 'dummy', id: 'fixture_id', name: 'fixture_name' } }, {}, {}, {}, {});

        this.browserConnection = {
            browserInfo: {
                alias: 'test_browser'
            },
            isHeadlessBrowser: () => false
        };

        this.commands      = [];
        this.expectedError = expectedError;
    }

    executeCommand (command) {
        this.commands.push(command);

        return this.expectedError ? Promise.reject(new Error(this.expectedError)) : Promise.resolve();
    }

    _addInjectables () {
    }

    _initRequestHooks () {
    }

    get id () {
        return 'test_run_id';
    }
};
