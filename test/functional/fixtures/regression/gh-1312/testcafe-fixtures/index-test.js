import { Selector } from 'testcafe';

fixture `gh-1312`
    .page `http://localhost:3000/fixtures/regression/gh-1312/pages/index.html`;

const shadowHeader = Selector(() => document.querySelector('#host').shadowRoot.querySelector('h1'));
const shadowInput  = Selector(() => document.querySelector('#host').shadowRoot.querySelector('input'));

test('click', async t => {
    await t
        .click(shadowHeader)
        .expect(shadowHeader.innerText).eql('Test passed');
});

test('typeText', async t => {
    await t
        .typeText(shadowInput, 'Test passed')
        .expect(shadowInput.value).eql('Test passed');
});
