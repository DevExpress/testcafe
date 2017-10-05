import { ClientFunction } from 'testcafe';

fixture `gh-1846`;

test
    .page('http://localhost:3000/fixtures/regression/gh-1846/pages/index.html')
    ('Click element under the panel', async t => {
        await t
            .hover('#bottom')
            .wait(500)
            .hover('#top')
            .click('#btn')
            .expect(ClientFunction(() => window.clickCount)()).eql(1);
    });
