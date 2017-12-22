fixture `Fail in beforeEach`
    .page `../pages/index.html`
    .beforeEach(() => {
        throw new Error('Fail in beforeEach');
    });

test('Screenshot on a beforeEach error', async t => {
    await t.click('body');
});

test
    .page('../pages/crop.html')
    ('Crop screenshots', async t => {
        await t.click('body');
    });
