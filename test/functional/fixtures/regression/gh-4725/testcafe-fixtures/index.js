fixture `GH-4725 - Should ensure AsyncEventEmitter from additional event subscriptions`
    .page `http://localhost:3000/fixtures/regression/gh-4725/pages/index.html`;

for (let i = 0; i < 2; i++) {
    test(`test ${i}`, async t => {
        if (t.browser.alias === 'Firefox')
            await t.wait(5000);
    });
}
