var expect          = require('chai').expect;
var Promise         = require('pinkie');
var noop            = require('lodash').noop;
var TestRun         = require('../../lib/test-run');
var ClickCommand    = require('../../lib/test-run/commands').Click;
var COMMAND_TYPE    = require('../../lib/test-run/commands/type');
var CLIENT_MESSAGES = require('../../lib/test-run/client-messages');

function wait (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

function nextTick () {
    return wait(0);
}

describe('TestRun', function () {
    it('Should raise an error on an attempt to execute a new command while the previous command execution is not yet finished.', function () {
        var expectedErrorMessage = 'An attempt to execute a command when a previous command is still being executed was detected.';
        var actualError          = null;
        var testMock             = {
            fixture: 'fixture',
            fn:      noop
        };

        var testRun = new TestRun(testMock);

        testRun.executeCommand(new ClickCommand());

        try {
            testRun.executeCommand(new ClickCommand());
        }
        catch (err) {
            actualError = err;
        }

        expect(actualError.message).eql(expectedErrorMessage);
    });

    //TODO: replace the following tests with functional when we have enough functionality
    it('Should reject the next command if there is no pending command and a js-error is raised', function () {
        var clickCommand = new ClickCommand();
        var callsite     = 'callsite';

        var testMock = {
            fixture: 'fixture',
            fn:      function (testRun) {
                return testRun.executeCommand(clickCommand, callsite);
            }
        };

        var browserConnectionMock = {
            userAgent: 'userAgent'
        };

        var jsError = { type: 'js-error' };
        var testRun = new TestRun(testMock, browserConnectionMock);

        testRun[CLIENT_MESSAGES.jsError]({ err: jsError });

        return testRun[CLIENT_MESSAGES.ready]({})
            .then(function (command) {
                expect(command.type).eql(COMMAND_TYPE.testDone);
                expect(testRun.errs[0].type).eql(jsError.type);
                expect(testRun.errs[0].callsite).eql(callsite);
            });
    });

    it('Should store the pending error when the test is done', function () {
        var testMock = {
            fixture: 'fixture',
            fn:      function () {
                return nextTick()
                    .then(Promise.resolve);
            }
        };

        var browserConnectionMock = {
            userAgent: 'userAgent'
        };

        var jsError = { type: 'js-error' };
        var testRun = new TestRun(testMock, browserConnectionMock);

        testRun[CLIENT_MESSAGES.jsError]({ err: jsError });

        return testRun[CLIENT_MESSAGES.ready]({})
            .then(function (command) {
                expect(command.type).eql(COMMAND_TYPE.testDone);
                expect(testRun.errs[0].type).eql(jsError.type);
            });
    });
});
