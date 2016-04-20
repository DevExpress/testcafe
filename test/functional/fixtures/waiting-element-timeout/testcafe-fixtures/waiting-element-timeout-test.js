// NOTE: to preserve callsites, add new tests AFTER the existing ones
fixture `Wait for element appearance before click`
    .page `http://localhost:3000/waiting-element-timeout/pages/index.html`;

test('Wait for element appearance before click', async t => {
    await t
        .click('#button1')
        .click('#button2');
});
