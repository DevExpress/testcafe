fixture `Test run commands queue`
    .page `http://localhost:3000/fixtures/test-run/pages/index.html`;

test('Check real driver task queue length', async t => {
    t.click('body');
    t.click('body');

    await t
        .expect(t.testRun.driverTaskQueue.length).eql(0)
        .expect(await t.testRun.driverTaskQueueLength).eql(2);
});
