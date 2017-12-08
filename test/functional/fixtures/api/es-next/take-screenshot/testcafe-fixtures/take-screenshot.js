import { ClientFunction } from 'testcafe';
import { parse } from 'useragent';
import { saveWindowState, restoreWindowState } from '../../../../../window-helpers';


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

test('Take a screenshot in quarantine mode', async t => {
    await t
        .takeScreenshot()
        .click('.notExist');
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
