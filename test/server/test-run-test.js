var expect          = require('chai').expect;
var Promise         = require('pinkie');
var noop            = require('lodash').noop;
var TestRun         = require('../../lib/test-run');
var commands        = require('../../lib/test-run/commands');
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
    it('Should send the pending command to the client and resolve/reject it when it is done', function () {
        var click1           = commands.createClickCommand();
        var click2           = commands.createClickCommand();
        var commandsToClient = [];
        var testRunDone      = false;

        var doneCommandResult = {
            failed: false
        };

        var actionError         = 'action-error';
        var failedCommandResult = {
            failed: true,
            err:    new Error(actionError)
        };

        var testMock = {
            fixture: 'fixture',

            fn: function (testRun) {
                return testRun.executeCommand(click1)
                    .then(function () {
                        return testRun.executeCommand(click2);
                    })
                    .then(function () {
                        throw new Error('The command should be rejected');
                    })
                    .catch(function (err) {
                        expect(err.message).equal(actionError);
                    });
            }
        };

        var testRun = new TestRun(testMock);

        testRun.once('done', function () {
            testRunDone = true;
        });

        function sendReadyClientRequest (commandResult) {
            return testRun[CLIENT_MESSAGES.ready](commandResult)
                .then(function (command) {
                    commandsToClient.push(command);
                });
        }

        return sendReadyClientRequest()
            .then(function () {
                // NOTE: simulates page reload before the pending step
                // is executed. This leads to a repeating ready message.
                return sendReadyClientRequest();
            })
            .then(function () {
                return sendReadyClientRequest(doneCommandResult);
            })
            .then(function () {
                return sendReadyClientRequest(failedCommandResult);
            })
            .then(function () {
                testRun[CLIENT_MESSAGES.done]();

                return nextTick();
            })
            .then(function () {
                expect(testRunDone).to.be.true;
                expect(commandsToClient.length).eql(4);
                expect(commandsToClient[0]).eql(click1);
                expect(commandsToClient[1]).eql(click1);
                expect(commandsToClient[2]).eql(click2);
                expect(commandsToClient[3].type).eql(commands.TYPE.testDone);
            });
    });

    it('Should call test.fn() and complete the test after the function is resolved', function () {
        var testMock = {
            fixture: 'fixture',
            fn:      Promise.resolve
        };

        var testRun = new TestRun(testMock);

        testRun[CLIENT_MESSAGES.ready]();

        return wait(10)
            .then(function () {
                return testRun[CLIENT_MESSAGES.ready]();
            })
            .then(function (command) {
                expect(command.type).eql(commands.TYPE.testDone);
            });
    });

    it('Should call test.fn() and complete the test with an error after the function is rejected', function () {
        var testError = 'test-error';
        var testMock  = {
            fixture: 'fixture',

            fn: function () {
                return Promise.reject(testError);
            }
        };

        var testRun = new TestRun(testMock);

        return testRun[CLIENT_MESSAGES.ready]()
            .then(function (command) {
                expect(testRun.errs[0]).eql(testError);
                expect(command.type).eql(commands.TYPE.testDone);
            });
    });

    it('Should raise an error on an attempt to execute a new command while the previous command execution is not yet finished.', function () {
        var expectedErrorMessage = 'An attempt to execute a command when a previous command is still being executed was detected.';
        var actualError          = null;
        var testMock             = {
            fixture: 'fixture',
            fn:      noop
        };

        var testRun = new TestRun(testMock);

        testRun.executeCommand(commands.createClickCommand());

        try {
            testRun.executeCommand(commands.createClickCommand());
        }
        catch (err) {
            actualError = err;
        }

        expect(actualError.message).eql(expectedErrorMessage);
    });

    it('Should reject the pending command if an js-error is raised', function () {
        var testMock = {
            fixture: 'fixture',
            fn:      noop
        };

        var clickCommand = commands.createClickCommand();
        var jsError      = 'js-error';

        var testRun = new TestRun(testMock);

        nextTick()
            .then(function () {
                return testRun[CLIENT_MESSAGES.ready]();
            })
            .then(function () {
                testRun[CLIENT_MESSAGES.jsError]({ failed: true, err: new Error(jsError) });
            });

        return testRun
            .executeCommand(clickCommand)
            .then(function () {
                throw new Error('Promise rejection is expected');
            })
            .catch(function (err) {
                expect(err.message).eql(jsError);
            });
    });

    it('Should reject the next command if there is no pending command and a js-error is raised', function () {
        var clickCommand = commands.createClickCommand();

        var testMock = {
            fixture: 'fixture',
            fn:      function (testRun) {
                return testRun.executeCommand(clickCommand);
            }
        };

        var jsError = 'js-error';
        var testRun = new TestRun(testMock);

        testRun[CLIENT_MESSAGES.jsError]({ err: jsError });

        return testRun[CLIENT_MESSAGES.ready]()
            .then(function (command) {
                expect(command.type).eql(commands.TYPE.testDone);
                expect(testRun.errs[0]).eql(jsError);
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

        var jsError = 'js-error';
        var testRun = new TestRun(testMock);

        testRun[CLIENT_MESSAGES.jsError]({ err: jsError });

        return testRun[CLIENT_MESSAGES.ready]()
            .then(function (command) {
                expect(command.type).eql(commands.TYPE.testDone);
                expect(testRun.errs[0]).eql(jsError);
            });
    });
});
