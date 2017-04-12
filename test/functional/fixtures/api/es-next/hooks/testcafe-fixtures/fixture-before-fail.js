fixture `Fixture1`
    .before(() => {
        throw new Error('$$before$$');
    });

test('Test1', () => {
});

test('Test2', () => {
});

test('Test3', () => {
});
