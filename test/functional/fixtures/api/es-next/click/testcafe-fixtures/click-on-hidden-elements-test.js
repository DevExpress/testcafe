fixture `Click`
    .page `http://localhost:3000/fixtures/api/es-next/click/pages/visible.html`;

test('Click on an element with width: 0 and height: 0', async t => {
    await t.click('.element.width-height-0');
});

test('Click on an element with width: 0', async t => {
    await t.click('.element.width-0');
});

test('Click on an element with height: 0', async t => {
    await t.click('.element.height-0');
});

test('Click on an element with display: none', async t => {
    await t.click('.element.display-none');
});

test('Click on an element with visibility: hidden', async t => {
    await t.click('.element.visibility-hidden');
});

test('Click on an element in ancestor with display: none', async t => {
    await t.click('.ancestor.display-none>.element');
});

test('Click on an element in ancestor with visibility: hidden', async t => {
    await t.click('.ancestor.visibility-hidden>.element');
});

test('Click on an option in not expended select with size less than 2', async t => {
    await t.click('.select-not-expended>option');
});

test('Click on a map element with not visible container', async t => {
    await t.click('.map-area');
});
