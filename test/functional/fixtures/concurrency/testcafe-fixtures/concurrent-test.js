import testInfo from '../test-info.js';

fixture `Concurrent`
    .page`../pages/index.html`
    .after(() => {
        testInfo.save();
        testInfo.clear();
    });

test('Long test', async t => {
    testInfo.add('test started');

    await t.wait(10000);

    testInfo.add('long finished');
});

test('Short test', async t => {
    testInfo.add('test started');

    await t.wait(1000);

    testInfo.add('short finished');
});
