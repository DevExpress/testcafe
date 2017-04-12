fixture `Wait`
    .page `http://localhost:3000/fixtures/api/es-next/wait/pages/index.html`;

test('Wait', async t => {
    await t
        .click('#button1')
        .wait(2000)
        .click('#button2');
});

test('Incorrect timeout argument (wait)', async t => {
    await t.wait(NaN);
});
