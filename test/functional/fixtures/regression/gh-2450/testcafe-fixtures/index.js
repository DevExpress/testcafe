import { Selector, ClientFunction } from 'testcafe';

fixture `GH-2450 - Scroll to element which is hidden by fixed`
    .page `http://localhost:3000/fixtures/regression/gh-2450/pages/index.html`;

const button1 = Selector('#button1');
const result  = Selector('#result');

const doScroll = ClientFunction(() => {
    window.scrollTo(5000, 5000);
});

const changeFixed = ClientFunction(() => {
    const inversed = 'inversed';

    document.getElementById('fixedTop').className  = inversed;
    document.getElementById('fixedLeft').className = inversed;
});

test('Scroll to right bottom corner', async t => {
    await doScroll();
    await t
        .click(button1)
        .expect(result.innerText).eql('button1');
});

test('Scroll to left upper corner', async t => {
    await changeFixed();
    await t
        .click(button1)
        .expect(result.innerText).eql('button1');
});

