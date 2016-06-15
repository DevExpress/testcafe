fixture `Page error`
    .page `http://localhost:3000/page-error/pages/index.html`;

test('Do not handle', async t => {
    await t.click('#unreachable-page-link');
});
