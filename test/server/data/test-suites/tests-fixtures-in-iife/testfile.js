(function () {
    fixture `fixture`.page`https://testPage`;

    (() => {
        test('testName', async t => {
            await t.click('body');
        })
    })();
})();
