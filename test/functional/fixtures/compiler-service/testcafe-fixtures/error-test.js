fixture `Compiler service`;

test(`Throw an error`, async t => {
    await t.click('#not-exists');
});
