import { ClientFunction } from 'testcafe';
import { expect } from 'chai';


fixture `GH-889`
    .page `http://localhost:3000/fixtures/regression/gh-889/pages/index.html`;

var getTableFocusEventCount = ClientFunction(() => window.tableFocusEventCount);
var getTableBlurEventCount  = ClientFunction(() => window.tableBlurEventCount);

test('Click on children of table', async t => {
    await t
        .click('#td1')
        .click('#div');

    expect(await getTableFocusEventCount()).equals(1);
    expect(await getTableBlurEventCount()).equals(0);
});

test('Click on children of table (for IE)', async t => {
    var getFirstTableDataFocusEventCount  = ClientFunction(() => window.firstTableDataFocusEventCount);
    var getSecondTableDataFocusEventCount = ClientFunction(() => window.secondTableDataFocusEventCount);

    await t
        .click('#td1')
        .click('#div');

    expect(await getTableFocusEventCount()).equals(0);
    expect(await getTableBlurEventCount()).equals(0);
    expect(await getFirstTableDataFocusEventCount()).equals(1);
    expect(await getSecondTableDataFocusEventCount()).equals(1);
});
