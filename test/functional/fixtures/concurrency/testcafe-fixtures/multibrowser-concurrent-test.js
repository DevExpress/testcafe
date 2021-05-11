import { saveTimeline } from '../common/timeline';
import { ClientFunction } from 'testcafe';

const getUserAgent = ClientFunction(() => navigator.userAgent);
const timeline     = Object.create(null);

fixture `Concurrent`
    .page`../pages/index.html`
    .beforeEach(async t => {
        t.ctx.userAgent = await getUserAgent();

        if (!timeline[t.ctx.userAgent])
            timeline[t.ctx.userAgent] = [];
    })
    .after(() => {
        saveTimeline(timeline);
    });

test('Long test', async t => {
    timeline[t.ctx.userAgent].push('test started');

    await t.wait(10000);

    timeline[t.ctx.userAgent].push('long finished');
});

test('Short test', async t => {
    timeline[t.ctx.userAgent].push('test started');

    await t.wait(1000);

    timeline[t.ctx.userAgent].push('short finished');
});
