import { Selector } from 'testcafe';

fixture `GH-2020 - Should click on element with height/width of 1px`
    .page `http://localhost:3000/fixtures/regression/gh-2020/pages/index.html`;

const el1    = Selector('#el1');
const el2    = Selector('#el2');
const result = Selector('#result');

test('Click on elements with height/width of 1px', async t => {
    await t
        .click(el1)
        .click(el2)
        .expect(result.innerText).eql('click1click2');
});
