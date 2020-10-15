fixture ('Fixture');

function fn (arg) {
    return arg;
}

test('test', async t => {
    const testVar = fn(true);

    await t.expect(testVar).ok();
});
