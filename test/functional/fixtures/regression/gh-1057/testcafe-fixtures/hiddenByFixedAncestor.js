import { Selector } from 'testcafe';

fixture `gh-1057 - fixed by hidden ancestor`
    .page `http://localhost:3000/fixtures/regression/gh-1057/pages/hiddenByFixedAncestor.html`;

const button1  = Selector('#button1');
const button2  = Selector('#button2');
const fixedDiv = Selector('#fixed');
const result   = Selector('#result');

test('click on elements', async t => {
    await t
        .click(button1)
        .click(button2)
        .click(fixedDiv)
        .expect(result.innerText).contains('button1 button2 fixed');
});
