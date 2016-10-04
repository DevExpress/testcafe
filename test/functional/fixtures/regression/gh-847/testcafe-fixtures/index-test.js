import { expect } from 'chai';
import { ClientFunction } from 'testcafe';

fixture `gh-847`
    .page `http://localhost:3000/fixtures/regression/gh-847/pages/index.html`;

test('gh-847', async t => {
    await t
        .click('#button2')
        .switchToIframe('#iframe')
        .click('#button')
        .switchToMainWindow()
        .click('#button');

    const buttonClicked = await ClientFunction(() => window.buttonClicked)();

    expect(buttonClicked).to.be.true;
});
