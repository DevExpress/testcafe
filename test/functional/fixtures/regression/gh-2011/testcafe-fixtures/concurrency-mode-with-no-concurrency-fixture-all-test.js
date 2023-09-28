
const connections = {};
const incConnection = (connectionId) => {
    if (!connections[connectionId])
        connections[connectionId] = 0;

    connections[connectionId]++;
};

fixture `fixture first`
    .page `http://localhost:3000/fixtures/regression/gh-2011/pages/index.html`
    .noConcurrency();

test('1 example', async t => {
    incConnection(t.testRun.browserConnection.id);
    await t.wait(100);
});

test('2 example', async t => {
    incConnection(t.testRun.browserConnection.id);
    await t.wait(100);
});

test('3 example', async t => {
    const connectionId = t.testRun.browserConnection.id;

    incConnection(connectionId);
    await t.wait(100).expect(connections[connectionId]).eql(3);
});

fixture `fixture second with disable parallel`
    .page `http://localhost:3000/fixtures/regression/gh-2011/pages/index.html`
    .noConcurrency();

test('4 example', async t => {
    incConnection(t.testRun.browserConnection.id);
    await t.wait(1000);
});

test('5 example', async t => {
    incConnection(t.testRun.browserConnection.id);
    await t.wait(100);
});

test('6 example', async t => {
    incConnection(t.testRun.browserConnection.id);
    await t.wait(100);
});

test('7 example', async t => {
    const connectionId = t.testRun.browserConnection.id;

    incConnection(connectionId);
    await t.wait(100).expect(connections[connectionId]).eql(4);
});

fixture `fixture third`
    .page `http://localhost:3000/fixtures/regression/gh-2011/pages/index.html`
    .noConcurrency();

test('8 example', async t => {
    incConnection(t.testRun.browserConnection.id);
    await t.wait(100);
});

test('9 example', async t => {
    const connectionId = t.testRun.browserConnection.id;

    incConnection(connectionId);
    await t.wait(100).expect(connections[connectionId]).eql(2);
});

