fixture `Fixture`
    .clientScripts({ content: 'console.log(2);' });

test
    .clientScripts({ content: 'console.log(3);' })
    ('test', async t => {
        const { log } = await t.getBrowserConsoleMessages();

        await t.expect(log.toString()).eql('1,2,3');
    });
