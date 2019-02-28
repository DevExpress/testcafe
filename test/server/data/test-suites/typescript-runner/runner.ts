import createTestCafe from 'testcafe';

fixture `Runner`;

test('Starts and terminates runner', async () => {
    const t = await createTestCafe();

    const remoteConnection = await t.createBrowserConnection();
    const runner = t.createRunner();

    runner.browsers(remoteConnection);

    return t.close();
});
