fixture `Should recreate close window watcher after new child window is opened`
    .page `http://localhost:3000/fixtures/multiple-windows/pages/i5857/index.html`;

test('Should recreate close window watcher after new child window is opened', async t => {
    await t.click('#openWindow');

    await t.click('#closeWindow');

    await t.click('#openWindow');

    await t.click('#closeWindow');
});
