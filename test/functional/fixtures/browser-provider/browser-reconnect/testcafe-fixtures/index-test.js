import { ClientFunction } from 'testcafe';

fixture `Browser reconnect`
    .page `http://localhost:3000/fixtures/browser-provider/browser-reconnect/pages/index.html`;

const counter      = {};
const getUserAgent = ClientFunction(() => navigator.userAgent.toString());

const hang = ClientFunction(() => {
    const now = Date.now();

    while (Date.now() < now + 5000) {
        // hang for 5s
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

test('Should fail on 3 disconnects', async t => {
    const userAgent = await getUserAgent();

    counter[userAgent] = counter[userAgent] || 0;

    counter[userAgent]++;

    await t.expect(counter[userAgent]) < 3;

    await hang();
});
