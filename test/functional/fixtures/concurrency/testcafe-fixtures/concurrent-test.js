import { saveTimeline } from '../common/timeline';

const timeline = [];

fixture `Concurrent`
    .page`../pages/index.html`
    .after(() => {
        saveTimeline(timeline);
    });

test('Long test', async t => {
    timeline.push('test started');

    await t.wait(10000);

    timeline.push('long finished');
});

test('Short test', async t => {
    timeline.push('test started');

    await t.wait(1000);

    timeline.push('short finished');
});
