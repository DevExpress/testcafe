// NOTE: to preserve callsites add new tests AFTER existing

fixture `TestController`
    .page `http://localhost:3000/api/es-next/test-controller/pages/index.html`;

test('Chaining', async t => {
    await t
        .click('#btn1')
        .click('#btn2');

    await t
        .click('#btn3')
        .click('#page2-btn1')
        .click('#page2-btn2');
});

test('Chaining callsites', async t => {
    await t
        .click('#btn1')
        .click('#btn2')
        .click('#error')
        .click('#btn3');
});
