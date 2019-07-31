require('./non-existing-module');

fixture('non existing module')
    .page('http://example.com');

test('non existing module', async t => {
});
