import t from 'testcafe';

fixture.skip `Skip`
    .page `http://devexpress.github.io/testcafe/example`;

test('Test', async t => {
    // Starts at http://devexpress.github.io/testcafe/example
});
