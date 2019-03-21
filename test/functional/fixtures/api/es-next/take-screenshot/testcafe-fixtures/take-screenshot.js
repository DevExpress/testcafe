import { ClientFunction } from 'testcafe';
import { parse, is } from 'useragent';
import { saveWindowState, restoreWindowState } from '../../../../../window-helpers';
import quarantineScope from './quarantineScope';
import sanitizeFilename from 'sanitize-filename';
import { readPngFile } from '../../../../../../../lib/utils/promisified-functions';
import config from '../../../../../config.js';
import { join } from 'path';


// NOTE: to preserve callsites, add new tests AFTER the existing ones
fixture `Take a screenshot`
    .page `../pages/index.html`;


const getUserAgent = ClientFunction(() => navigator.userAgent.toString());

test('Take a screenshot', async t => {
    await t
        .takeScreenshot()
        .takeScreenshot();
});

test('Take a screenshot with a custom path (OS separator)', async t => {
    const ua       = await getUserAgent();
    const parsedUA = parse(ua);

    await t.takeScreenshot('custom/' + parsedUA.family + '.png');
});

test('Take a screenshot with a custom path (DOS separator)', async t => {
    const ua       = await getUserAgent();
    const parsedUA = parse(ua);

    await t.takeScreenshot('custom\\' + parsedUA.family + '.png');
});

test('Incorrect action path argument', async t => {
    await t.takeScreenshot(1);
});

test('Forbidden characters in the path argument', async t => {
    await t.takeScreenshot('path:with*forbidden|chars');
});

test('Take a screenshot in quarantine mode', async t => {
    await t
        .takeScreenshot()
        .click('.notExist');
});

test('Take screenshots with same path', async t => {
    await t
        .takeScreenshot('1.png')
        .takeScreenshot('1.png');
});

test('Take screenshots for reporter', async t => {
    const userAgent     = await getUserAgent();
    const safeUserAgent = sanitizeFilename(parse(userAgent).toString()).replace(/\s+/g, '_');

    quarantineScope[safeUserAgent] = quarantineScope[safeUserAgent] || {};

    const attemptNumber = quarantineScope[safeUserAgent].attemptNumber || 1;

    const getFileName = fileName => {
        return safeUserAgent + attemptNumber + fileName;
    };

    await t
        .takeScreenshot(getFileName('1.png'))
        .takeElementScreenshot('body', getFileName('2.png'));

    quarantineScope[safeUserAgent].attemptNumber = attemptNumber + 1;

    if (attemptNumber === 1)
        throw new Error('Quarantine error');
});

test
    .page('../pages/crop.html')
    .before(async t => {
        await saveWindowState(t);

        await t.maximizeWindow();
    })
    .after(t => restoreWindowState(t))
    ('Should crop screenshots', async t => {
        const ua       = await getUserAgent();
        const parsedUA = parse(ua);

        await t.takeScreenshot('custom/' + parsedUA.family + '.png');
    });

test
    .page('../pages/crop-scrollbars.html')
    ('Should crop scrollbar', async t => {
        const getScrollbarSize = ClientFunction(() => {
            const el = document.getElementById('scrollParent');

            return el.offsetWidth - el.clientWidth;
        });

        await saveWindowState(t);

        const { width, height } = t.ctx._savedWindowState;

        const ua             = await getUserAgent();
        const parsedUA       = parse(ua);
        const screenshotName = 'custom/' + parsedUA.family + '.png';

        const scrollbarSize = await getScrollbarSize();

        await t.hover('#target');
        await t.takeScreenshot(screenshotName);

        const png = await readPngFile(join(config.testScreenshotsDir, screenshotName));

        const expectedWidth  = width - scrollbarSize;
        const expectedHeight = height - scrollbarSize;

        // NOTE: IE clips screenshots not accurately
        const accuracy        = is(ua).ie ? 1 : 0;

        await t.expect(scrollbarSize).gt(0);
        await t.expect(Math.abs(png.width - expectedWidth)).lte(accuracy);
        await t.expect(Math.abs(png.height - expectedHeight)).lte(accuracy);
    });
