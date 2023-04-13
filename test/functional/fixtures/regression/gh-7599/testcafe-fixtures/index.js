fixture `Multiple windows in the Native Automation mode`
    .page `http://localhost:3000/fixtures/regression/gh-7599/pages/index.html`;

test(`Should fail on link[target="blank"] click`, async t => {
    await t.click('a');
});

test(`Should fail on Multiple Window API call in the Native Automation mode`, async t => {
    await t.openWindow('http://example.com');
});
