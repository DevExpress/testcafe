fixture `Multiple windows remote`
    .page `http://localhost:3000/fixtures/api/es-next/multiple-windows/pages/index.html`;

test('Should fail on remote', async t => {
    await t.openWindow('http://localhost:3000/fixtures/api/es-next/multiple-windows/pages/index.html');
});
