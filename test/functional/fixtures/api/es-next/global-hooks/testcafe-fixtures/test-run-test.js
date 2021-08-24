fixture`Fixture 1`;

test('Test1', async t => {
    await t
        .expect(t.testRun.testRunCtx.testRunBefore).eql(1)
        .expect(t.testRun.testRunCtx.testRunAfter).eql(0);

    t.testRun.testRunCtx.testsCompleted = 1;
});

test('Test2', async t => {
    await t
        .expect(t.testRun.testRunCtx.testRunBefore).eql(1)
        .expect(t.testRun.testRunCtx.testRunAfter).eql(0);

    t.testRun.testRunCtx.testsCompleted++;
});

fixture`Fixture2`;

test('Test3', async t => {
    await t
        .expect(t.testRun.testRunCtx.testRunBefore).eql(1)
        .expect(t.testRun.testRunCtx.testRunAfter).eql(0);

    t.testRun.testRunCtx.testsCompleted++;
});
