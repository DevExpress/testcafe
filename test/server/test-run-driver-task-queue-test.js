const CLIENT_MESSAGES = require('../../lib/test-run/client-messages');
const { expect }      = require('chai');

const {
    PressKeyCommand,
    ExecuteAsyncExpressionCommand,
    ExecuteExpressionCommand,
} = require('../../lib/test-run/commands/actions');

const { WaitCommand } = require('../../lib/test-run/commands/observation');
const BaseTestRunMock = require('./helpers/base-test-run-mock');


class TestRunMock extends BaseTestRunMock {
    _executeJsExpression () {
        return 'expression result';
    }

    _executeAsyncJsExpression () {
        return 'async expression result';
    }
}

const testRunMock = new TestRunMock();

function createDriverStatusMsg (id = 'id') {
    return {
        cmd:    'ready',
        status: {
            id,
            pageError:       null,
            consoleMessages: [],
            isCommandResult: true,
        },
    };
}

function imitateCommandResolvingFromClient () {
    setTimeout(() => {
        testRunMock[CLIENT_MESSAGES.ready](createDriverStatusMsg('1'))
            .then(() => {
                return testRunMock[CLIENT_MESSAGES.ready](createDriverStatusMsg('2'));
            });
    }, 0);
}

describe('Driver task queue', () => {
    it('Should return real queue length after all client commands are added', async () => {
        const commandExecutionPromises = [
            testRunMock._internalExecuteCommand(new PressKeyCommand({ keys: 'a' })),
            testRunMock._internalExecuteCommand(new PressKeyCommand({ keys: 'b' })),
        ];

        const driverTaskQueueLength     = testRunMock.driverTaskQueue.length;
        const realDriverTaskQueueLength = await testRunMock.driverTaskQueueLength;

        imitateCommandResolvingFromClient();

        await Promise.all(commandExecutionPromises);

        expect(driverTaskQueueLength).eql(0);
        expect(realDriverTaskQueueLength).eql(2);
    });

    it('Should return real queue length after all server commands are added', async () => {
        const commandExecutionPromises = [
            testRunMock.executeCommand(new WaitCommand({ timeout: 0 })),
            testRunMock.executeCommand(new WaitCommand({ timeout: 0 })),
        ];

        const driverTaskQueueLength     = testRunMock.driverTaskQueue.length;
        const realDriverTaskQueueLength = await testRunMock.driverTaskQueueLength;

        imitateCommandResolvingFromClient();

        await Promise.all(commandExecutionPromises);

        expect(driverTaskQueueLength).eql(0);
        expect(realDriverTaskQueueLength).eql(0);
    });

    it('Should return real queue length after execute-expression commands are added', async () => {
        const commandExecutionPromises = [
            testRunMock.executeCommand(new ExecuteExpressionCommand({
                resultVariableName: 'el1',
                expression:         'Selector(\'div\')',
            })),
            testRunMock.executeCommand(new ExecuteExpressionCommand({
                resultVariableName: 'el2',
                expression:         'Selector(\'div\')',
            })),
            testRunMock.executeCommand(new ExecuteAsyncExpressionCommand({
                expression: 'return Selector(\'div\')',
            })),
            testRunMock.executeCommand(new ExecuteAsyncExpressionCommand({
                expression: `
                await t.click('#input1');
                await t.click('#input2');
                await t.click('#input3');
            `,
            })),
        ];

        const driverTaskQueueLength     = testRunMock.driverTaskQueue.length;
        const realDriverTaskQueueLength = await testRunMock.driverTaskQueueLength;

        imitateCommandResolvingFromClient();

        await Promise.all(commandExecutionPromises);

        expect(driverTaskQueueLength).eql(0);
        expect(realDriverTaskQueueLength).eql(0);
    });
});
