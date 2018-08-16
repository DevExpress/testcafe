fixture('Fixture3')
    .page `https://example.com`;

test('test', async () => {
    setTimeout(function () {
        throw new Error('unhandled');
    }, 0);
});
