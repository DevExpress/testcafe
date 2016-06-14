import { ClientFunction } from 'testcafe';
import { expect } from 'chai';

fixture `Page error`
    .page `http://localhost:3000/page-error/pages/index.html`;

test('Do not handle', async t => {
    await t.click('#unreachable-page-link');
});

// TODO: action error recovery (GH-567)
test('Handle', async t => {
    try {
        await t.click('#unreachable-page-link');
    }
    catch (err) {
        await t.navigateTo('handled.html');
    }

    var pageTitle = ClientFunction(() => document.title)();

    expect(pageTitle).contains('Page error handled');
});
