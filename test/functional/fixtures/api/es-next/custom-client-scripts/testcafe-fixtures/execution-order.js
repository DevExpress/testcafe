fixture `Fixture`
    .clientScripts({ content: 'console.log(1);' });

test
    .clientScripts({ content: 'console.log(2);' })
    ('test', async t => {
        const { log } = await t.getBrowserConsoleMessages();

        await t.expect(log.toString()).eql('1,2');
    });
