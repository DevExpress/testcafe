fixture `NavigateTo`
    .page `http://localhost:3000/fixtures/api/es-next/navigate-to/pages/index.html`;

test('Navigate to another page', async t => {
    await t.navigateTo('navigation.html')
        .click('#button');
});

test('Incorrect protocol', async t => {
    await t.navigateTo('ftp://localhost:3000/fixtures/api/es-next/navigate-to/pages/index.html');
});
