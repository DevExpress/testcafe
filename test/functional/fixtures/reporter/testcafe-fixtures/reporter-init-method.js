fixture `Reporter init method`
    .page('http://localhost:3000/fixtures/reporter/pages/index.html');

test(`test`, async t => {
    await t.wait(1);
});
