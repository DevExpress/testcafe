fixture`Report Data API`
    .page('../pages/index.html');

test('Run t.report action twice', async t => {
    await t.report(['Report 1', 'Report 2']);
    await t.report('Report 3');
});

test('Run t.report action with object val', async t => {
    await t.report('Report 1');
    await t.report({ 'reportResult': 'test' });
});

test('Run t.report action with multiple args', async t => {
    await t.report('Report 1', 'Report2', { 'reportResult': 'test' });
    await t.report('Report 3', 'Report 4');
});
