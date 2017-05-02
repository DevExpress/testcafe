/// <reference path="../../../../../ts-defs/index.d.ts" />
import 'testcafe';

fixture
    .skip
    .only
    ('Fixture1')
    .page('http://example.com')
    .httpAuth({
        username: 'user',
        password: 'pass',
        domain: 'domain',
        workstation: 'workstation'
    })
    .before(async() => {
    })
    .after(async() => {
    })
    .beforeEach(async t => {
        t.ctx['1'] = 2;
        t.ctx['someKey'] = [];
        t.fixtureCtx['yo'] = 'hey';
    })
    .afterEach(async t => {
        await t.click('#smth');
    });

test
    .before(async t => {
        await t.click('#smth');
    })
    .after(async t => {
        await t.click('#smth');
    })
    ('Test1', async t => {
        t.ctx['1'] = 2;
        t.ctx['someKey'] = [];
        t.fixtureCtx['yo'] = 'hey';

        await t.click('#smth');
    })
    .skip
    .only
    .page('http://example.com')
    .httpAuth({
        username: 'user',
        password: 'pass',
        domain: 'domain',
        workstation: 'workstation'
    });
