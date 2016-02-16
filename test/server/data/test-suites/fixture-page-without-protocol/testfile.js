fixture `Fixture1`
    .page `example.org`;

test('Fixture1Test', () => {
});

fixture `Fixture${1 + 1}`
    .page `//example.org`;

test('Fixture2Test', () => {
});
