import { ClientFunction } from 'testcafe';
import { expect } from 'chai';


fixture `GH-889`
    .page `http://localhost:3000/fixtures/regression/gh-889/pages/index.html`;

test('Click on children of table', async t => {
    var getTableFocusEventCount = ClientFunction(() => window.tableFocusEventCount);
    var getTableBlurEventCount  = ClientFunction(() => window.tableBlurEventCount);

    await t
        .click('#cell')
        .click('#div');

    expect(await getTableFocusEventCount()).equals(1);
    expect(await getTableBlurEventCount()).equals(0);
});
