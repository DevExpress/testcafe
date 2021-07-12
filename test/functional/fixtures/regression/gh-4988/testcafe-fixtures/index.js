import { Selector } from 'testcafe';

const btn1  = Selector('#btn1');
const btn2  = Selector('#btn2');
const btn3  = Selector('#btn3');
const btn4  = Selector('#btn4');
const btn5  = Selector('#btn5');
const btn6  = Selector('#btn6');
const btn7  = Selector('#btn7');
const btn8  = Selector('#btn8');
const btn9  = Selector('#btn9');
const btn10 = Selector('#btn10');
const frm1  = Selector('#iframe1');
const frm2  = Selector('#iframe2');

async function assert (t, expectedElement, iframeElement) {
    await t.pressKey('tab');

    if (iframeElement)
        await t.switchToIframe(iframeElement);

    await t.expect(expectedElement.focused).eql(true);

    if (iframeElement)
        await t.switchToMainWindow();
}

fixture `GH-4988 - improved algo for shadow/iframe elements`
    .page `http://localhost:3000/fixtures/regression/gh-4988/pages/index.html`;

test('iframe', async t => {
    await assert(t, btn6);
    await assert(t, btn2);
    await assert(t, btn9, frm2);
    await assert(t, btn8, frm2);
    await assert(t, btn7, frm2);
    await assert(t, btn1);
    await assert(t, btn5, frm1);
    await assert(t, btn4, frm1);
    await assert(t, btn3, frm1);
    await assert(t, btn10);
});
