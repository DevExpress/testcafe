import { Selector, ClientFunction } from 'testcafe';

fixture `gh-1521`;

test
    .page('../pages/hidden-element.html')
    ('Wait for an out-of-viewport element', async t => {
        const getEventCount = ClientFunction(event => window.eventCounter[event]);
        const target        = Selector('#out-of-viewport-input', { timeout: 5000 });

        const actions = [
            {
                name:          'click',
                perform:       async () => await t.click(target),
                expectedEvent: 'click'
            },

            {
                name:          'doubleClick',
                perform:       async () => await t.doubleClick(target),
                expectedEvent: 'dblclick'
            },

            {
                name:          'hover',
                perform:       async () => await t.hover(target),
                expectedEvent: 'mouseover'
            },

            {
                name:          'rightClick',
                perform:       async () => await t.rightClick(target),
                expectedEvent: 'contextmenu'
            },

            {
                name:          'drag',
                perform:       async () => await t.drag(target, 100, 100),
                expectedEvent: 'mousedown'
            },

            {
                name:          'selectText',
                perform:       async () => await t.selectText(target),
                expectedEvent: 'mousedown'
            }
        ];

        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];

            await t.click('#show-hidden-input');
            await action.perform();

            const actualEventCount = await getEventCount(action.expectedEvent);

            await t.expect(actualEventCount).eql(1, `${action.name} failed`);
            await t.click('#reset-page');
        }
    });

test
    .page('http://localhost:3000/fixtures/regression/gh-1521/pages/hidden-element.html')
    ('Try to click on an out-of-viewport element', async t => {
        await t.click(Selector('#out-of-viewport-input', { timeout: 2000 }));
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
    .page('http://localhost:3000/fixtures/regression/gh-1521/pages/svg-element.html')
    ('Click on svg child', async t => {
        // NOTE: it's a regression test created during gh-1521 development.
        // Automations were waiting for a whole timeout when try to perform an
        // action with a svg element every time. The test checks that now it's fixed.
        const timeout = 5000;
        const target  = Selector('#svg', { timeout });

        await t.expect(target.visible).ok();

        const startTime = Date.now();

        await t.click(target);

        const finishTime         = Date.now();
        const documentClickCount = await t.eval(() => window.documentClickCount);

        await t
            .expect(finishTime - startTime).lt(timeout)
            .expect(documentClickCount).eql(1);
    });

test
    .page('http://localhost:3000/fixtures/regression/gh-1521/pages/moving-element.html')
    ('Click on a moving element', async t => {
        const target = Selector('#target', { timeout: 5000 });

        await t
            .hover(Selector('#start'))
            .click(target);

        const clickCount = await t.eval(() => window.clickCount);

        await t.expect(clickCount).eql(1);
    });

test
    .page('http://localhost:3000/fixtures/regression/gh-1521/pages/fixed-element.html')
    ('Click on a fixed element', async t => {
        // NOTE: ensure the page is loaded
        const timeout   = 3000;
        const startTime = await t.eval(() => Date.now());

        await t.click(Selector('#target', { timeout }));

        const endTime = Date.now();

        await t.expect(endTime - startTime).lt(timeout);
    });

test
    .page('http://localhost:3000/fixtures/regression/gh-1521/pages/changing-element.html')
    ('Click on a changing element', async t => {
        const target = Selector('#out-of-viewport-input', { timeout: 3000 });

        await t
            .click('#show-hidden-input')
            .click(target)
            .expect(ClientFunction(() => window.clickCount)()).eql(1, 'check element click count', { timeout: 0 });
    });

test
    .page('http://localhost:3000/fixtures/regression/gh-1521/pages/hover-element.html')
    ('Hover to an overlapped element', async t => {
        const target = Selector('#target', { timeout: 5000 });

        await t
            .hover('#loading-panel')
            .hover(target)
            .expect(ClientFunction(() => window.mouseOverRaised)()).ok('', { timeout: 10000 })
            .expect(ClientFunction(() => window.mouseMoveRaised)()).ok('');
    });
