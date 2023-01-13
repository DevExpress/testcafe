import testInfo from '../test-info.js';
import { ClientFunction } from 'testcafe';

const getUserAgent = ClientFunction(() => navigator.userAgent);
const data         = Object.create(null);

fixture `Concurrent`
    .page`../pages/index.html`
    .beforeEach(async t => {
        t.ctx.userAgent = await getUserAgent();

        if (!data[t.ctx.userAgent])
            data[t.ctx.userAgent] = [];
    })
    .after(() => {
        testInfo.setData(data);
        testInfo.save();
        testInfo.clear();
    });

test('Long test', async t => {
    data[t.ctx.userAgent].push('test started');

    await t.wait(10000);

    data[t.ctx.userAgent].push('long finished');
});

test('Short test', async t => {
    data[t.ctx.userAgent].push('test started');

    await t.wait(1000);

    data[t.ctx.userAgent].push('short finished');
});
