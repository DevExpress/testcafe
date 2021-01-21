import { ClientFunction } from 'testcafe';

fixture `Browser reconnect`
    .page `http://localhost:3000/fixtures/browser-provider/browser-reconnect/pages/index.html`;

const counter      = {};
const getUserAgent = ClientFunction(() => navigator.userAgent.toString());
let ctx            = null;

const hang = ClientFunction(() => {
    const now = Date.now();

    while (Date.now() < now + 10000) {
        // hang for 10s
    }
});

test('Should restart browser when it does not respond', async t => {
    const userAgent = await getUserAgent();

    counter[userAgent] = counter[userAgent] || 0;

    counter[userAgent]++;

    if (counter[userAgent] < 3)
        await hang();

    await t.expect(counter[userAgent]).eql(3);
});

test('Should fail on 3 disconnects in one browser', async t => {
    const userAgent = await getUserAgent();

    counter[userAgent] = counter[userAgent] || 0;

    counter[userAgent]++;

    ctx = ctx || userAgent;

    if (ctx === userAgent) {
        await hang();

        throw new Error('browser has not restarted');
    }

    await t.expect(counter[userAgent]).eql(1);
});

test('Should restart browser on timeout if the `closeBrowser` method hangs', async t => {
    const userAgent = await getUserAgent();

    counter[userAgent] = counter[userAgent] || 0;

    counter[userAgent]++;

    if (counter[userAgent] < 2) {
        await hang();

        throw new Error('browser has not restarted');
    }

    await t.expect(counter[userAgent]).eql(2);
});

test('Should log error on browser disconnect', async t => {
    t.testRun.browserConnection.emit('disconnected', new Error('disconnected'));

    setTimeout(() => {
        t.testRun.browserConnection.emit('error', new Error('force error'));
    }, 5000);
});
