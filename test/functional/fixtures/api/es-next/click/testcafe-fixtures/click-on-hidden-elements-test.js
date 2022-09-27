fixture `Click`
    .page `http://localhost:3000/fixtures/api/es-next/click/pages/visible.html`;

test('Click on an element with width: 0', async t => {
    await t.click('.width-0');
});

test('Click on an element with height: 0', async t => {
    await t.click('.height-0');
});

test('Click on an element with display: none', async t => {
    await t.click('.display-none');
});

test('Click on an element with visibility: hidden', async t => {
    await t.click('.visibility-hidden');
});
