fixture`Report Data API`
    .page('../pages/index.html');

test('Run t.report action', async t => {
    await t
        .report(t.browser.alias)
        .report(1, true, 'string', { 'reportResult': 'test' });
});
