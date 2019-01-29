import { expect } from 'chai';
import { ClientFunction } from 'testcafe';

fixture `gh845`
    .page `http://localhost:3000/fixtures/regression/gh-845/pages/index.html`;


const MAX_UNLOADING_TIMEOUT = 17 * 1000;
const getDelay              = ClientFunction(() => Date.now() - window.startTime);
const setStartTime          = ClientFunction(() => {
    window.startTime = Date.now();
});

test('Click on a download link', async t => {
    await setStartTime();

    await t.click('#link');

    const delay = await getDelay();

    expect(delay).to.be.below(MAX_UNLOADING_TIMEOUT);
});

test('Click on a download link in iframe', async t => {
    await t.switchToIframe('#iframe');

    await setStartTime();

    await t.click('#link');

    const delay = await getDelay();

    expect(delay).to.be.below(MAX_UNLOADING_TIMEOUT);
});
