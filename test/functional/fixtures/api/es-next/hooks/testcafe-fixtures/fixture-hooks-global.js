fixture `Fixture 1`;

test('Test1', async t => {
    await t
        .expect(global.fixtureBefore).eql(1)
        .expect(global.fixtureAfter).eql(0);
});

test('Test2', async t => {
    await t
        .expect(global.fixtureBefore).eql(1)
        .expect(global.fixtureAfter).eql(0);
});

fixture `Fixture2`;

test('Test3', async t => {
    await t
        .expect(global.fixtureBefore).eql(2)
        .expect(global.fixtureAfter).eql(1);
});
