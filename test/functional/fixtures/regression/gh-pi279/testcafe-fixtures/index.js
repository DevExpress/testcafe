const { Selector } = require('testcafe');

fixture `Disable multiple windows in Native Automation`
    .page `http://localhost:3000/fixtures/regression/gh-pi279/pages/index.html`;

test('link', async t => {
    await t.click(Selector('a'));
});

test('window.open', async t => {
    await t.click(Selector('button'));
});
