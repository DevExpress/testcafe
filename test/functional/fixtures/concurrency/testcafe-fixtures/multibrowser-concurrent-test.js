import { ClientFunction } from 'testcafe';

const getUserAgent = ClientFunction(() => navigator.userAgent);

fixture `Concurrent`
    .page`../pages/index.html`
    .beforeEach(async t => {
        t.ctx.userAgent = await getUserAgent();

        if (!global.timeline[t.ctx.userAgent])
            global.timeline[t.ctx.userAgent] = [];
    });

test('Long test', async t => {
    global.timeline[t.ctx.userAgent].push('test started');

    await t.wait(10000);

    global.timeline[t.ctx.userAgent].push('long finished');
});

test('Short test', async t => {
    global.timeline[t.ctx.userAgent].push('test started');

    await t.wait(1000);

    global.timeline[t.ctx.userAgent].push('short finished');
});
