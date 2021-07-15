fixture('Fixture3');

test('test', async () => {
    setTimeout(function () {
        throw new Error('unhandled');
    }, 0);
});
