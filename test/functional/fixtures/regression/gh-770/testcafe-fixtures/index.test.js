import { ClientFunction } from 'testcafe';
import { expect } from 'chai';


fixture `GH-770`
    .page `http://localhost:3000/fixtures/regression/gh-770/pages/index.html`;

const isDocumentBodyActiveElement = ClientFunction(() => document.activeElement === document.body);


test('click non-focusable div', async t => {
    await t.click('#simpleDiv');

    expect(await isDocumentBodyActiveElement()).to.be.true;
});
