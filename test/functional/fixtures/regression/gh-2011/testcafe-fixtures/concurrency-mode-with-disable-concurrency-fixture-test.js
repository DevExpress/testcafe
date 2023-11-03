const CONCURRENCY = 3;

const connectionsFixture1 = {};
const connectionsFixture2 = {};
const connectionsFixture3 = {};

const addConnection = (connections, connectionId) => {
    connections[connectionId] = true;
};

fixture `first concurrent fixture`
    .beforeEach(async t => {
        addConnection(connectionsFixture1, t.testRun.browserConnection.id);
    })
    .afterEach(async t => {
        await t.expect(Object.keys(connectionsFixture1).length).lte(CONCURRENCY);
    })
    .after(() => {
        if (Object.keys(connectionsFixture1).length !== CONCURRENCY)
            throw new Error(`should run tests in ${CONCURRENCY} browsers instances`);
    })
    .page `http://localhost:3000/fixtures/regression/gh-2011/pages/index.html`;

for (let i = 0; i < 10; i++) {
    test(`concurrent test ${i}`, async () => {
    });
}

fixture `no concurrent fixture`
    .beforeEach(async t => {
        addConnection(connectionsFixture2, t.testRun.browserConnection.id);
    })
    .afterEach(async t => {
        await t.expect(Object.keys(connectionsFixture2).length).eql(1);
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

fixture `fixture third`
    .beforeEach(async t => {
        addConnection(connectionsFixture3, t.testRun.browserConnection.id);

        await t.wait(2000);
    })
    .afterEach(async t => {
        await t.expect(Object.keys(connectionsFixture3).length).lte(CONCURRENCY);
    })
    .after(() => {
        if (Object.keys(connectionsFixture3).length !== CONCURRENCY)
            throw new Error(`should run tests in ${CONCURRENCY} browsers instances`);
    })
    .page `http://localhost:3000/fixtures/regression/gh-2011/pages/index.html`;

for (let i = 0; i < 10; i++) {
    test(`concurrent test ${i}`, async () => {
    });
}
