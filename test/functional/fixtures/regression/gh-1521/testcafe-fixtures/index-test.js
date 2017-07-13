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

test
    .page('http://localhost:3000/fixtures/regression/gh-1521/pages/unclickable-element.html')
    ('Click on an unclickable element', async t => {
        const timeout = 5000;
        const target  = Selector('#target', { timeout });

        await t.expect(target.visible).ok();

        const startTime = Date.now();

        await t.click(target);

        const finishTime         = Date.now();
        const documentClickCount = await t.eval(() => window.documentClickCount);
        const elementClickCount  = await t.eval(() => window.elementClickCount);

        await t
            .expect(finishTime - startTime).lt(timeout)
            .expect(documentClickCount).eql(1)
            .expect(elementClickCount).eql(0);
    });

test
    .page('http://localhost:3000/fixtures/regression/gh-1521/pages/moving-element.html')
    ('Click on a moving element', async t => {
        const target  = Selector('#target', { timeout: 5000 });

        await t
            .hover(Selector('#start'))
            .click(target);

        const clickCount  = await t.eval(() => window.clickCount);

        await t.expect(clickCount).eql(1);
    });
