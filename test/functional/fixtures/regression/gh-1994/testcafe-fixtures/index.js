fixture `f`;

test(`test1`, async t => {
    await t.navigateTo('http://example.com');

    await t.click('h1', { speed: 0.01 });
    await t.click('p', { speed: 0.01 });
});

test(`test2`, async t => {
    await t.navigateTo('http://example.com');

    await t.click('a', { speed: 0.01 });

    await t.click('h1', { speed: 0.01 });
});
