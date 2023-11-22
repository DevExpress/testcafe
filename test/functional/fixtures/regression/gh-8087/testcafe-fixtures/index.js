const connectionsFixture = {};

let attempt = 0;

const addConnection = (connections, connectionId) => {
    if (!connections[connectionId])
        connections[connectionId] = 1;
    else
        connections[connectionId]++;
};

const getAttempts = () => attempt++;

fixture `disableConcurrency fixture`
    .beforeEach(async t => {
        addConnection(connectionsFixture, t.testRun.browserConnection.id);
    })
    .afterEach(async t => {
        await t.expect(Object.keys(connectionsFixture).length).eql(1);
    })
    .after(() => {
        if (Object.values(connectionsFixture)[0] !== 7)
            throw new Error();
    })
    .disableConcurrency;

for (let i = 1; i <= 5; i++) {
    test(`test ${i}`, async (t) => {
        await t.wait(1000);
        if (i === 1 && getAttempts() < 2)
            throw new Error();
    });
}
