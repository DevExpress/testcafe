/// <reference path="../../../../../ts-defs/index.d.ts" />
import { Selector } from 'testcafe';

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

    });

test
    .before(async t => {

    })
    .after(async t => {

    })
    ('Test1', async t => {

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
