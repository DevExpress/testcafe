import { ClientFunction } from 'testcafe';

fixture `Specifying the page load timeout at run level`;

// NOTE: For slow mobile browsers on CI machines the internal methods chain (parsing the tested web page, emitting appropriate events, calling the reporter methods)
// can take a long time
const expectedTimeoutForLongLoadPages = 6000;

test
    .page('http://localhost:3000/fixtures/api/es-next/page-load-timeout/pages/window-load.html')
    ('Wait for window.load', async t => {
        await t.expect(ClientFunction(() => window.loadEventRaised)()).ok('Test started before window.load', { timeout: 0 });
    });

test
    .page('http://localhost:3000/fixtures/api/es-next/page-load-timeout/pages/window-load-long.html')
    ("Don't wait for window.load more than timeout", async t => {
        const { startTestTime, pageOpenedTime } = await t.eval(() => {
            return {
                pageOpenedTime: window.pageOpenedTime,
                startTestTime:  Date.now()
            };
        });

        await t.expect(startTestTime - pageOpenedTime).lt(expectedTimeoutForLongLoadPages);
    });

test
    .page('http://localhost:3000/fixtures/api/es-next/page-load-timeout/pages/window-load-long-no-handlers.html')
    ("Don't wait for window.load", async t => {
        const { startTestTime, pageOpenedTime } = await t.eval(() => {
            return {
                pageOpenedTime: window.pageOpenedTime,
                startTestTime:  Date.now()
            };
        });

        await t.expect(startTestTime - pageOpenedTime).lt(expectedTimeoutForLongLoadPages);
    });
