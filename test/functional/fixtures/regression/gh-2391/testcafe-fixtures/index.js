import { Selector } from 'testcafe';

fixture `GH-2391 - should scroll to element if it is hidden by fixed`
    .page `../pages/index.html`;

const button1  = Selector('#button1');
const button2  = Selector('#button2');
const fixedDiv = Selector('#fixed');
const result   = Selector('#result');

test('click on elements', async t => {
    await t
        .click(button1)
        .click(button2)
        .click(fixedDiv)
        .expect(result.innerText).eql('button1 button2 fixed');
});
