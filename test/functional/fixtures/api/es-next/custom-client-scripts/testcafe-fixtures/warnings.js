fixture `Fixture`;

test
    .clientScripts(
        { content: '' },
        { content: '' },
        { content: '1' },
        { content: '1' },
        { path: '../data/set-flag1.js' },
        { path: '../data/set-flag1.js' })
    ('test', async () => {});
