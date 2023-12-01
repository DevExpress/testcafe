import testInfo from '../test-info.js';

let value = 0;

fixture('Concurrent fixture before hook')
    .before(async () => {
        testInfo.add('fixture before hook started');
        await new Promise(r => setTimeout(r, 10000));
        // Value should be set before any test starts
        value = 10;
        testInfo.add('fixture before hook finished');
    })
    .after(() => {
        testInfo.save();
        testInfo.clear();
    });

test('test1', async t => {
    await t.expect(value).eql(10);
    testInfo.add('test finished');
});

test('test2', async t => {
    await t.expect(value).eql(10);
    testInfo.add('test finished');
});

test('test3', async t => {
    await t.expect(value).eql(10);
    testInfo.add('test finished');
});
