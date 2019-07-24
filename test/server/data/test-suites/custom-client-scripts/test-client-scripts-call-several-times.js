fixture `Fixture`;

test
    .clientScripts('script1.js')
    .clientScripts('script2.js')
    ('test', async t => {});
