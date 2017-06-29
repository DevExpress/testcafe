import { Selector } from 'testcafe';

fixture `gh-1521`;

test
    .page('http://localhost:3000/fixtures/regression/gh-1521/pages/hidden-element.html')
    ('Wait for an out-of-viewport element', async t => {
        await t
            .click('#show-hidden-button')
            .click(Selector('#out-of-viewport-btn', { timeout: 2000 }));

        const btnClickCount = await t.eval(() => window.outOfViewportBtnClick);

        await t.expect(btnClickCount).eql(1);
    });

test
    .page('http://localhost:3000/fixtures/regression/gh-1521/pages/hidden-element.html')
    ('Try to click on an out-of-viewport element', async t => {
        await t.click(Selector('#out-of-viewport-btn', { timeout: 2000 }));
    });
