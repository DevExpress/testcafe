const TEST_COUNT = 10;

const SINGLE_CONNECTION_ERROR    = 'should run current fixture tests only in one browser instance';
const INCORRECT_TEST_COUNT_ERROR = 'should run corrent test count in single fixture';

const connectionsFixture1 = {};
const connectionsFixture2 = {};
const connectionsFixture3 = {};

function incrementConnectionCount (connections, connectionId) {
    if (!connections[connectionId])
        connections[connectionId] = 0;

    connections[connectionId]++;
}

function assertSingleConnection (connections) {
    if (Object.keys(connections).length !== 1)
        throw new Error(SINGLE_CONNECTION_ERROR);

    if (Object.values(connections)[0] !== TEST_COUNT)
        throw new Error(INCORRECT_TEST_COUNT_ERROR);

}

fixture `fixture 1`
    .page `http://localhost:3000/fixtures/regression/gh-2011/pages/index.html`
    .beforeEach(async t => {
        incrementConnectionCount(connectionsFixture1, t.testRun.browserConnection.id);

        await t.wait(100);
    })
    .after(() => {
        assertSingleConnection(connectionsFixture1);
    })
    .disableConcurrency;

for (let i = 0; i < TEST_COUNT; i++) {
    test(`fixture 1 - test ${i}`, async () => {
    });
}

fixture `fixture 2`
    .page `http://localhost:3000/fixtures/regression/gh-2011/pages/index.html`
    .beforeEach(async t => {
        incrementConnectionCount(connectionsFixture2, t.testRun.browserConnection.id);

        await t.wait(100);
    })
    .after(() => {
        assertSingleConnection(connectionsFixture2);
    })
    .disableConcurrency;

for (let i = 0; i < TEST_COUNT; i++) {
    test(`fixture 2 - test ${i}`, async () => {
    });
}

fixture `fixture 3`
    .page `http://localhost:3000/fixtures/regression/gh-2011/pages/index.html`
    .beforeEach(async t => {
        incrementConnectionCount(connectionsFixture3, t.testRun.browserConnection.id);

        await t.wait(100);
    })
    .after(() => {
        assertSingleConnection(connectionsFixture3);
    })
    .disableConcurrency;

for (let i = 0; i < TEST_COUNT; i++) {
    test(`fixture 3 - test ${i}`, async () => {
    });
}
