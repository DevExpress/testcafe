import { saveTimeline } from '../common/timeline';

const timeline = [];

fixture `Sequential`
    .page`../pages/index.html`
    .after(() => {
        saveTimeline(timeline);
    });

test('Long test', async t => {
    timeline.push('long started');

    await t.wait(10000);

    timeline.push('long finished');
});

test('Short test', async t => {
    timeline.push('short started');

    await t.wait(1000);

    timeline.push('short finished');
});
