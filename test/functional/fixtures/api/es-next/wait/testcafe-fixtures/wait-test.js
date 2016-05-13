fixture `Wait`
    .page `http://localhost:3000/api/es-next/wait/pages/index.html`;

test('Wait', async t => {
    await t
        .click('#button1')
        .wait(2000)
        .click('#button2');
});

test('Wait for element', async t => {
    await t
        .click('#button1')
        .waitForElement('#button2', 2000)
        .click('#button2');
});

test('Incorrect timeout argument (wait)', async t => {
    await t.wait(NaN);
});

test('Incorrect selector argument', async t => {
    await t.waitForElement(null, 2000);
});

test('Incorrect timeout argument (waitForElement)', async t => {
    await t.waitForElement('#timeout1', -1);
});
