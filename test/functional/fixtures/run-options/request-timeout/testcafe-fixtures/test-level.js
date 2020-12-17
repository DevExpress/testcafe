import { Selector } from 'testcafe';

fixture ('request timeout')
    .page('http://localhost:3000/fixtures/run-options/request-timeout/pages/index.html');

test
    .timeouts({ pageRequestTimeout: 100 })
    ('page request timeout', async t => {
        await t.click('#redirect-to-page');
    });

test
    .timeouts({ ajaxRequestTimeout: 100 })
    ('ajax request timeout', async t => {
        await t
            .click('#send-xhr')
            .expect(Selector('#send-xhr-status').textContent).notEql('Done');
    });
