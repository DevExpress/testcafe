fixture('Fixture1')
    .page('http://example.com');

test
    .meta(null)
    ('Fixture1Test1', async () => {
        // do nothing
    });
