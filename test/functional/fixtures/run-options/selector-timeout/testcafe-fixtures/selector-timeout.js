// NOTE: to preserve callsites, add new tests AFTER the existing ones
fixture `Wait for element appearance before click`
    .page `http://localhost:3000/fixtures/run-options/selector-timeout/pages/index.html`;

test('Wait for element with timeout enough for it to appear', async t => {
    await t
        .click('#button1')
        .click('#button');
});

test('Wait for element with insufficient timeout', async t => {
    await t
        .click('#button2')
        .click('#button');
});
