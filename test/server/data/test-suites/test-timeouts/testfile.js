fixture `Test timeouts`;

test
    .timeouts(20000)
    ('test', async () => {});
