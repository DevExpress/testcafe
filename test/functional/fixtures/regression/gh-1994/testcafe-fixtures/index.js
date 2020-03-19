fixture `GH-1994 - The element that matches the specified selector is not visible`
    .page `../pages/index.html`;

test(`Recreate invisible element and click`, async t => {
    await t.click('asdfsdf');
    // t.click('h1');
    // t.click('h1');
});
