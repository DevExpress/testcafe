fixture `Should pass the "error.id" argument to the reporter`
    .page `http://localhost:3000/fixtures/regression/gh-6646/pages/index.html`;

test(`Action error`, async t => {
    await t.click('non-existing-element');
});
