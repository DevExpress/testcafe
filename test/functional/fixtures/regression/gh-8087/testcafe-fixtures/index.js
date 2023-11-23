

const testRunInfo = {
    attemptCount: 0,
    connections:  {},
};

const addConnection = (connections, connectionId) => {
    if (!connections[connectionId])
        connections[connectionId] = 1;
    else
        connections[connectionId]++;
};


fixture `disableConcurrency fixture`
    .beforeEach(async t => {
        addConnection(testRunInfo.connections, t.testRun.browserConnection.id);
    })
    .afterEach(async t => {
        await t.expect(Object.keys(testRunInfo.connections).length).eql(1);
    })
    .after(() => {
        if (Object.keys(testRunInfo.connections).length !== 1 || Object.values(testRunInfo.connections)[0] !== 3)
            throw new Error();
    })
    .disableConcurrency;

for (let i = 0; i <= 1; i++) {
    test(`test ${i}`, async () => {
        testRunInfo.attemptCount++;
        if (testRunInfo.attemptCount < 2)
            throw new Error();
    });
}
