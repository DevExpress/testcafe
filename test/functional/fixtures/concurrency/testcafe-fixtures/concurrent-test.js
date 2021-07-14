import timeline from '../timeline';

fixture `Concurrent`
    .page`../pages/index.html`
    .after(() => {
        timeline.save();
        timeline.clear();
    });

test('Long test', async t => {
    timeline.add('test started');

    await t.wait(10000);

    timeline.add('long finished');
});

test('Short test', async t => {
    timeline.add('test started');

    await t.wait(1000);

    timeline.add('short finished');
});
