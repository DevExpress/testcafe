import { ClientFunction } from 'testcafe';

fixture `Specifying the page load timeout at test level`;

// NOTE: For slow mobile browsers on CI machines the internal methods chain (parsing the tested web page, emitting appropriate events, calling the reporter methods)
// can take a long time
const expectedTimeoutForLongLoadPages = 6000;

test
    .timeouts({ pageLoadTimeout: 10000 })
    ('Wait for window.load', async t => {
        await t
            .navigateTo('http://localhost:3000/fixtures/api/es-next/page-load-timeout/pages/window-load.html')
            .expect(ClientFunction(() => window.loadEventRaised)()).ok('Test started before window.load', { timeout: 0 });
    });

test
    .timeouts({ pageLoadTimeout: 10000 })
    ('Wait for window.load in iframe', async t => {
        await t
            .navigateTo('http://localhost:3000/fixtures/api/es-next/page-load-timeout/pages/with-iframe.html')
            .switchToIframe('#iframe')
            .expect(ClientFunction(() => window.loadEventRaised)()).ok('Test started before window.load', { timeout: 0 });
    });

test
    .page('http://localhost:3000/fixtures/api/es-next/page-load-timeout/pages/window-load-long.html')
    .timeouts({ pageLoadTimeout: 0 })
    ("Don't wait for window.load", async t => {
        const { startTestTime, pageOpenedTime } = await t.eval(() => {
            return {
                pageOpenedTime: window.pageOpenedTime,
                startTestTime:  Date.now(),
            };
        });

        await t.expect(startTestTime - pageOpenedTime).lt(expectedTimeoutForLongLoadPages);
    });

test('The `t.setPageLoadTimeout` method should raise a deprecation warning', async t => {
    // NOTE: warning will be raised only once
    for (let i = 0; i < 5; i++)
        await t.setPageLoadTimeout(1000);
});
