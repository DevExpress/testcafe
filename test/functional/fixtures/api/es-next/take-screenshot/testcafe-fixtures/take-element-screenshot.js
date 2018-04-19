import { ClientFunction } from 'testcafe';
import { parse } from 'useragent';
import { saveWindowState, restoreWindowState } from '../../../../../window-helpers';


const getUserAgent        = ClientFunction(() => navigator.userAgent.toString());

const enableScrollWatcher = ClientFunction(() => window.addEventListener('scroll', () => {
    window.wasScrolled = true;
}));

const checkWindowScroll            = ClientFunction(() => window.wasScrolled);
const getInternalScrollEventsCount = ClientFunction(() => window.internalScrollEventsCount);

// NOTE: to preserve callsites, add new tests AFTER the existing ones
fixture `Take a screenshot`
    .page `../pages/element-screenshot.html`
    .beforeEach(async t => {
        const ua = await getUserAgent();

        t.ctx.parsedUA = parse(ua);

        await saveWindowState(t);

        await t.maximizeWindow();
    })
    .afterEach(t => restoreWindowState(t));

test('Incorrect action selector argument', async t => {
    await t.takeElementScreenshot(1, 'custom/' + t.ctx.parsedUA.family + '.png');
});

test('Incorrect action path argument', async t => {
    await t.takeElementScreenshot('table', 1);
});

test('Invalid dimensions', async t => {
    await t.takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png', { crop: { left: -10, right: -50 } });
});

test('Invisible element', async t => {
    await t
        .click('#hide')
        .takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png');
});

test('Non-existent element', async t => {
    await t
        .click('#remove')
        .takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png');
});

test('Invalid scroll target', async t => {
    await t.takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png', { scrollTargetX: -2000, scrollTargetY: -3000 });
});

test('Element', async t => {
    await enableScrollWatcher();

    await t
        .takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png')
        .expect(getInternalScrollEventsCount()).gt(0)
        .expect(checkWindowScroll()).notOk();
});

test('Element with margins', async t => {
    await t.takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png', { includeMargins: true });
});

test('Default crop', async t => {
    await t.takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png', { crop: { right: 50, bottom: 50 } });
});

test('Top-left', async t => {
    await t.takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png', { crop: { left: 0, top: 0, right: 50, bottom: 50 } });
});

test('Top-right', async t => {
    await t.takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png', { crop: { left: -50, top: 0, bottom: 50 } });
});

test('Bottom-left', async t => {
    await t.takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png', { crop: { left: 0, top: -50, right: -50 } });
});

test('Bottom-right', async t => {
    await t.takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png', { crop: { left: 50, top: -50 } });
});

test
    .page('../pages/same-domain-iframe.html')
    ('Same-domain iframe', async t => {
        await t
            .switchToIframe('iframe')
            .takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png');
    });

test
    .page('../pages/nested-iframe.html')
    ('Nested iframes', async t => {
        await t
            .switchToIframe('iframe')
            .switchToIframe('iframe')
            .takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png');
    });

test
    .page('../pages/nested-iframe.html')
    ('Rescroll parents', async t => {
        await t
            .switchToIframe('iframe')
            .switchToIframe('iframe')
            .takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png')
            .switchToMainWindow()
            .expect(getInternalScrollEventsCount()).eql(1)
            .switchToIframe('iframe')
            .expect(getInternalScrollEventsCount()).eql(1)
            .switchToIframe('iframe')
            .expect(getInternalScrollEventsCount()).eql(1);
    });

test
    .page('../pages/cross-domain-iframe.html')
    ('Cross-domain iframe', async t => {
        await t
            .switchToIframe('iframe')
            .takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png');
    });

test('Scroll target', async t => {
    await t.takeElementScreenshot('body', 'custom/' + t.ctx.parsedUA.family + '.png', { scrollTargetX: 2000, scrollTargetY: 3000 });
});

test('Negative scroll target', async t => {
    await t.takeElementScreenshot('body', 'custom/' + t.ctx.parsedUA.family + '.png', { scrollTargetX: -2000, scrollTargetY: -3000 });
});

test
    .page('../pages/element-bottom-right.html')
    (`Bottom-right element`, async t => {
        await t.takeElementScreenshot('table', 'custom/' + t.ctx.parsedUA.family + '.png');
    });
