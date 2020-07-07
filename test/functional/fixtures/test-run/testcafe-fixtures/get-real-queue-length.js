import { PressKeyCommand, ExecuteAsyncExpressionCommand, ExecuteExpressionCommand } from '../../../../../lib/test-run/commands/actions';
import { WaitCommand } from '../../../../../lib/test-run/commands/observation';


fixture `Test run commands queue`
    .page `http://localhost:3000/fixtures/test-run/pages/index.html`;

test('Check real driver task queue length (client command)', async t => {
    const commandExecutionPromises = [
        t.testRun.executeCommand(new PressKeyCommand({ keys: 'a' })),
        t.testRun.executeCommand(new PressKeyCommand({ keys: 'b' }))
    ];

    const driverTaskQueueLength     = t.testRun.driverTaskQueue.length;
    const realDriverTaskQueueLength = await t.testRun.driverTaskQueueLength;

    await Promise.all(commandExecutionPromises);

    await t
        .expect(driverTaskQueueLength).eql(0)
        .expect(realDriverTaskQueueLength).eql(2);
});

test('Check real driver task queue length (server command)', async t => {
    const commandExecutionPromises = [
        t.testRun.executeCommand(new WaitCommand({ timeout: 0 })),
        t.testRun.executeCommand(new WaitCommand({ timeout: 0 }))
    ];

    const driverTaskQueueLength     = t.testRun.driverTaskQueue.length;
    const realDriverTaskQueueLength = await t.testRun.driverTaskQueueLength;

    await Promise.all(commandExecutionPromises);

    await t
        .expect(driverTaskQueueLength).eql(0)
        .expect(realDriverTaskQueueLength).eql(0);
});

test('Check driver task queue length (execute-expression command)', async t => {
    const commandExecutionPromises = [
        t.testRun.executeCommand(new ExecuteExpressionCommand({
            resultVariableName: 'el1',
            expression:         'Selector(\'div\')'
        })),
        t.testRun.executeCommand(new ExecuteExpressionCommand({
            resultVariableName: 'el2',
            expression:         'Selector(\'div\')'
        })),
        t.testRun.executeCommand(new ExecuteAsyncExpressionCommand({
            expression: 'return Selector(\'div\')'
        })),
        t.testRun.executeCommand(new ExecuteAsyncExpressionCommand({
            expression: `
                await t.click('#input1');
                await t.click('#input2');
                await t.click('#input3');
            `
        }))
    ];

    const driverTaskQueueLength     = t.testRun.driverTaskQueue.length;
    const realDriverTaskQueueLength = await t.testRun.driverTaskQueueLength;

    await Promise.all(commandExecutionPromises);

    await t
        .expect(driverTaskQueueLength).eql(0)
        .expect(realDriverTaskQueueLength).eql(0);
});
