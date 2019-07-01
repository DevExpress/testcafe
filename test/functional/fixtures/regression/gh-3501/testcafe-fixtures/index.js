fixture `Should focus label if it is bound to element and has tabIndex attribute`
    .page `http://localhost:3000/fixtures/regression/gh-3501/pages/index.html`;

import { Selector, ClientFunction } from 'testcafe';

const label1 = Selector('#label1');
const label2 = Selector('#label2');

const getLog = ClientFunction(() => {
    return window.eventLog;
});

test(`Label bound to radio is focused`, async t => {
    await t.click(label1);

    const log = await getLog();

    await t.expect(log).eql([
        'focus. Target: label1',
        'click. Target: label1',
        'focus. Target: radio'
    ]);


});

test(`Label bound to checkbox is focused`, async t => {
    await t.click(label2);

    const log = await getLog();

    await t.expect(log).eql([
        'focus. Target: label2',
        'click. Target: label2',
        'focus. Target: checkbox'
    ]);
});

