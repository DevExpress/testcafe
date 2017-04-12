fixture.only `Fixture1`;

test('Fixture1Test1', () => {
    throw new Error('Fixture1Test1');
});

fixture.only('Fixture2');

test('Fixture2Test1', () => {
    throw new Error('Fixture2Test1');
});

fixture `Fixture3`.only;

test('Fixture3Test1', () => {
    throw new Error('Fixture3Test1');
});

fixture `Fixture4`;

test('Fixture4Test1', () => {
    throw new Error('Fixture4Test1');
});

fixture `Fixture5`;

test.only('Fixture5Test1', () => {
    throw new Error('Fixture5Test1');
});

test('Fixture5Test2', () => {
    throw new Error('Fixture5Test2');
});

test('Fixture5Test3', () => {
    throw new Error('Fixture5Test3');
}).only;

test('Fixture5Test4', () => {
    throw new Error('Fixture5Test4');
});

test('Fixture5Test5', () => {
}).only;
