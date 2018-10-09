import { Selector } from 'testcafe';

fixture `GH-2861`
    .page `http://localhost:3000/fixtures/regression/gh-2861/pages/index.html`;

const btn1   = Selector('#btn1');
const btn2   = Selector('#btn2');
const result = Selector('#result');

test('Should not hang on custom element click', async (t) => {
    await t
        .click(btn1)
        .expect(result.innerText).eql('')
        .click(btn1, { offsetX: 1, offsetY: 1 })
        .expect(result.innerText).eql('clicked')
        .click(btn2)
        .expect(result.innerText).eql('clickedclicked');
});
