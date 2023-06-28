import { Selector, ClientFunction } from 'testcafe';

const getTitle      = ClientFunction(() => document.title);
const titleSelector = Selector('title');

fixture`Should return correct page title`
    .page`http://localhost:3000/fixtures/regression/gh-7833/pages/index.html`;

test('Should click element if it\'s overlapped by StatusBar', async t => {
    await t
        .expect(titleSelector.textContent).eql('gh-7833')
        .expect(await getTitle()).eql('gh-7833');
});
