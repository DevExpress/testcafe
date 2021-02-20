fixture `Page Load Timeout`;

test
    .timeouts({ pageLoadTimeout: -1 })
    ('test', async () => {});
