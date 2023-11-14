import { ClientFunction } from 'testcafe';

const getFailedFetchWindow = ClientFunction(() => window.failedFetch);

fixture `GH-7097 - Should fail fetch on non exist path with disableNativeAutomation`;

test(`fail fetch on non exist path with disableNativeAutomation`, async t => {
    await t.navigateTo('http://localhost:3000/fixtures/regression/gh-7097/pages/index.html');

    await t.wait(100); // We wait when fench failed on client

    await t.expect(await getFailedFetchWindow()).eql(true);
});
