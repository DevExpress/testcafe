fixture `Test run commands queue`
    .page `http://localhost:3000/fixtures/test-run/pages/index.html`;

test('Check real driver task queue length', async t => {
    t.testRun.executeCommand({ type: '' });
    t.testRun.executeCommand({ type: '' });

    const driverTaskQueueLength     = t.testRun.driverTaskQueue.length;
    const realDriverTaskQueueLength = await t.testRun.driverTaskQueueLength;

    await t
        .expect(driverTaskQueueLength).eql(0)
        .expect(realDriverTaskQueueLength).eql(2);
});
