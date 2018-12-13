fixture('Fixture3')
    .page `https://example.com`;

test('test', async t => {
    t.testRun.addError = function () {
        throw new Error('Exception in the handler');
    };

    setTimeout(function () {
        throw new Error('Exception in the code');
    }, 0);
});
