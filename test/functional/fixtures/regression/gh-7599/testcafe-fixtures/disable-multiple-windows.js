import { Selector } from 'testcafe';

fixture `Fixture`;

test
    .page('http://localhost:3000/fixtures/regression/gh-7599/pages/disable-multiple-windows/window-open.html')
    ('window.open', async t => {
        await t
            .click('#btn')
            .expect(Selector('h1').textContent).eql('Child page');
    });

test
    .page('http://localhost:3000/fixtures/regression/gh-7599/pages/disable-multiple-windows/click-on-link.html')
    ('click on link', async t => {
        await t
            .click('#link')
            .expect(Selector('h1').textContent).eql('Child page');
    });

test
    .page('http://localhost:3000/fixtures/regression/gh-7599/pages/disable-multiple-windows/form-submit.html')
    ('form submit', async t => {
        await t
            .click('#submitBtn')
            .expect(Selector('h1').textContent).eql('Child page');
    });
