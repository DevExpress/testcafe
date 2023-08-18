const fs   = require('fs');
const path = require('path');

import { RequestMock } from 'testcafe';

const mock = RequestMock().onRequestTo(/tryout.html\/$/)
    .respond((req, res) => {
        res.headers = {
            'Content-Type': 'text/html',
        };
        res.setBody(fs.readFileSync(path.resolve(__dirname, '../pages/tryout.html').toString()));
    });

fixture('Native Automation: ClientScripts + RequestMock')
    .clientScripts({ content: "(()=> console.log('test'))()" })
    .requestHooks(mock)
    .page('tryout.html');

test('test', async t => {
    const { log } = await t.getBrowserConsoleMessages();

    await t.expect(log).eql(['test']);
});
