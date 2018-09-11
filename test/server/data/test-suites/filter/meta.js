fixture('Fixture4')
    .page `https://example.com`
    .meta('meta', 'test')
    .meta('another', 'more');

test('Fixture4Test1', async () => {});

fixture('Fixture5')
    .meta('not', 'match')
    .page `https://example.com`

test('Fixture5Test1', async () => {});

test
    .meta('meta', 'test')
    .meta('more', 'meta')
    ('Fixture5Test2', async () => {});
