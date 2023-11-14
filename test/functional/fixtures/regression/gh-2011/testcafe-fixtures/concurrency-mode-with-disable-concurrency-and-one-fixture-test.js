const connectionsFixture = {};

const addConnection = (connections, connectionId) => {
    connections[connectionId] = true;
};

fixture `no concurrent fixture`
    .beforeEach(async t => {
        addConnection(connectionsFixture, t.testRun.browserConnection.id);
    })
    .afterEach(async t => {
        await t.expect(Object.keys(connectionsFixture).length).eql(1);
    })
    .page `http://localhost:3000/fixtures/regression/gh-2011/pages/index.html`
    .disableConcurrency;

test('long concurrent test 1', async t => {
    await t.wait(5000);
});

for (let i = 0; i < 10; i++) {
    test(`no concurrent test ${i}`, async () => {
    });
}
