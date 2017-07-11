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

test
    .page('http://localhost:3000/fixtures/regression/gh-1521/pages/overlap-element.html')
    ('Wait until element is not overlapped', async t => {
        await t.eval(() => {
            window.setTimeout(function () {
                document.getElementById('overlap-div').style.display = 'none';
            }, 1000);
        });

        await t.click(Selector('#target-btn', { timeout: 2000 }));

        const targetBtnClick  = await t.eval(() => window.targetBtnClick);
        const overlapDivClick = await t.eval(() => window.overlapDivClick);

        await t
            .expect(targetBtnClick).eql(1)
            .expect(overlapDivClick).notOk();
    });

test
    .page('http://localhost:3000/fixtures/regression/gh-1521/pages/overlap-element.html')
    ('Click on an overlapping element after some timeout', async t => {
        await t.click(Selector('#target-btn', { timeout: 2000 }));

        const targetBtnClick  = await t.eval(() => window.targetBtnClick);
        const overlapDivClick = await t.eval(() => window.overlapDivClick);

        await t
            .expect(targetBtnClick).notOk()
            .expect(overlapDivClick).eql(1);
    });
