import testInfo from '../test-info.js';

fixture `Concurrent`
    .page`../pages/index.html`
    .after(() => {
        testInfo.save();
        testInfo.clear();
    });

test('Long test', async t => {
    testInfo.add('test started');

    await t.wait(2000);

    testInfo.add('long finished');
});

test('Short test', async t => {
    testInfo.add('test started');

    await t.wait(200);

    testInfo.add('short finished');
});
