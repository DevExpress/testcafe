fixture `Should throw error if cannot restore child links`
    .page('http://localhost:3000/fixtures/multiple-windows/pages/i4760/index.html');

test('test', async t => {
    await t
        .click('a')
        .click('button')
        .click('a');
});
