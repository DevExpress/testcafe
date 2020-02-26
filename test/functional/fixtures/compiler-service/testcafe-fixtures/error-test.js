fixture `Compiler service`;

test(`Throw an error`, async t => {
    await t.expect(String(process.ppid)).eql(process.env.TESTCAFE_PID);

    await t.click('#not-exists');
});
