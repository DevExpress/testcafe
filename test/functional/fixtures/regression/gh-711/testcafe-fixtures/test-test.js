import { ClientFunction } from 'testcafe';
import { expect } from 'chai';


fixture `GH-711`
    .page `http://localhost:3000/fixtures/regression/gh-711/pages/index.html`;

test('Typing in contentEditable body', async t => {
    await (ClientFunction(() => document.body.innerHTML = ''))();

    await t
        .click('body')
        .typeText('body', 'test');
    
    var actualText   = await (ClientFunction(() => document.body.textContent))();

    expect(actualText.indexOf('test') !== -1).to.be.ok;
});

test('Typing in contentEditable body with not-contentEditable children', async t => {
    await t
        .selectText('body')
        .typeText('body', 'test');

    var expectedText = 'div1\ntest\ndiv3';
    var actualText   = await (ClientFunction(() => document.body.textContent))();

    expect(actualText.indexOf(expectedText) !== -1).to.be.ok;
});
