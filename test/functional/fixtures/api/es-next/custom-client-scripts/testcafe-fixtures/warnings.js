fixture `Fixture`;

test
    .clientScripts(
        { content: '' },
        { content: '' },
        { content: '1' },
        { content: '1' },
        { path: 'test/functional/fixtures/api/es-next/custom-client-scripts/data/set-flag1.js' },
        { path: 'test/functional/fixtures/api/es-next/custom-client-scripts/data/set-flag1.js' })
    ('test', async () => {});
