import { ClientFunction } from 'testcafe';
import { expect } from 'chai';


fixture `GH-850`
    .page `http://localhost:3000/fixtures/regression/gh-850/pages/index.html`;

const getBtnClickCount = ClientFunction(() => window.btnClickCount);


test('Move from reloaded iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#replace-src')
        .switchToMainWindow()
        .click('#simple-btn');

    const btnClickCount = await getBtnClickCount();

    expect(btnClickCount).eql(1);
});
