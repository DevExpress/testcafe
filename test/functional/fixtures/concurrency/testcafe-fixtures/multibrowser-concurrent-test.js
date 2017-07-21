import { ClientFunction } from 'testcafe';

const getUserAgent = ClientFunction(() => navigator.userAgent);

const timelines = {};

fixture `Concurrent`
    .page`../pages/index.html`
    .beforeEach(async t => {
        t.ctx.userAgent = await getUserAgent();

        if (!timelines[t.ctx.userAgent])
            timelines[t.ctx.userAgent] = [];
    });

test('Long test', async t => {
    timelines[t.ctx.userAgent].push('test started');

    await t.wait(5000);

    timelines[t.ctx.userAgent].push('long finished');
});

test('Short test', async t => {
    timelines[t.ctx.userAgent].push('test started');

    await t.wait(1000);

    timelines[t.ctx.userAgent].push('short finished');
});

test('Results', async t => {
    await t.wait(6000);

    await t.expect(Object.keys(timelines).length).gt(1);

    for (const timeline of Object.values(timelines))
        await t.expect(timeline).eql(['test started', 'test started', 'short finished', 'long finished']);
});
