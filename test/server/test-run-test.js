var expect        = require('chai').expect;
var noop          = require('lodash').noop;
var TestRun       = require('../../lib/test-run');
var createCommand = require('../../lib/test-run/commands').createCommandFromObject;
var COMMAND_TYPE  = require('../../lib/test-run/commands/type');


describe('TestRun', function () {
    it('Should raise an error on an attempt to execute a new command while the previous command execution is not yet finished', function () {
        var expectedErrorMessage = 'Internal error: an attempt to execute a command when a previous command is still being executed was detected.';

        var actualError           = null;
        var browserConnectionMock = { userAgent: 'userAgent' };

        var testMock = {
            fixture: { path: 'yo' },
            fn:      noop
        };

        var testRun = new TestRun(testMock, browserConnectionMock);

        testRun.executeCommand(createCommand({
            type:     COMMAND_TYPE.click,
            selector: '#yo'
        }));

        try {
            testRun.executeCommand(createCommand({
                type:     COMMAND_TYPE.click,
                selector: '#yo'
            }));
        }
        catch (err) {
            actualError = err;
        }

        expect(actualError.message).eql(expectedErrorMessage);
    });
});
