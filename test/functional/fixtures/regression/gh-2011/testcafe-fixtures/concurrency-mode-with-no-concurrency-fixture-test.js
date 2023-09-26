
let connections = 0;
let connectionId = null;

fixture `fixture first`
    .page `https://www.example.com`

test('1 example', async t => {
    await t.wait(100);
})

test('2 example', async t => {
    await t.wait(100);
})

test('3 example', async t => {
    await t.wait(100);
})

fixture `fixture second with disable parallel`
    .page `https://www.example.com`
    .noConcurrency()

test('4 example', async t => {
    connectionId = t.testRun.browserConnection.id;
    connections++;

    await t.wait(100);
})

test('5 example', async t => {
    if (connectionId === t.testRun.browserConnection.id)
        connections++

    await t.wait(100)
})

test('6 example', async t => {
    if (connectionId === t.testRun.browserConnection.id)
        connections++;
    
    await t.wait(100);
})

test('7 example', async t => {
    if (connectionId === t.testRun.browserConnection.id)
        connections++;

    await t
        .wait(100)
        .expect(connections).eql(4);
})

fixture `fixture third`
    .page `https://www.example.com`

test('8 example', async t => {
    await t.wait(100);
})

test('9 example', async t => {
    await t.wait(100);
})
