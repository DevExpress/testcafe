import { parse } from 'useragent';
import { ClientFunction } from 'testcafe';

const getWindowWidth             = ClientFunction(() => window.innerWidth);
const getWindowHeight            = ClientFunction(() => window.innerHeight);
const getUserAgent               = ClientFunction(() => navigator.userAgent.toString());
const setWindowOnresizeHandler   = ClientFunction(() => {
    window.onresize = function () {
        window.onresize = function () {
        };

        /* eslint-disable no-alert*/
        alert('Alert!');
        /* eslint-enable no-alert*/
    };
});
const resetWindowOnresizeHandler = ClientFunction(() => window.onresize = function () {
});

var initialWindowSize = {};

fixture `Native dialogs during resizeWindow action`
    .page `http://localhost:3000/fixtures/native-dialogs-handling/es-next/pages/index.html`
    .beforeEach(async () => {
        var ua       = await getUserAgent();
        var parsedUA = parse(ua);

        initialWindowSize[parsedUA.family] = {
            width:  await getWindowWidth(),
            height: await getWindowHeight()
        };
    })
    .afterEach(async t => {
        var ua       = await getUserAgent();
        var parsedUA = parse(ua);
        var size     = initialWindowSize[parsedUA.family];

        await resetWindowOnresizeHandler();

        await t
            .resizeWindow(size.width, size.height);
    });

//resizeWindow
test('Dialog appears during resizeWindow action', async t => {
    await setWindowOnresizeHandler();

    await t.resizeWindow(500, 500)
        .handleAlertDialog();
});

test('No expected alert during resizeWindow action', async t => {
    await t
        .resizeWindow(500, 500)
        .handleAlertDialog({ timeout: 200 });
});

test('Unexpected alert during resizeWindow action', async t => {
    await setWindowOnresizeHandler();

    await t
        .resizeWindow(500, 500);
});
