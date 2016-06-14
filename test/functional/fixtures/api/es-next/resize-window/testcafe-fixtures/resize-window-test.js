// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { ClientFunction } from 'testcafe';
import { expect } from 'chai';
import { parse } from 'useragent';

const getWindowWidth  = ClientFunction(() => window.innerWidth);
const getWindowHeight = ClientFunction(() => window.innerHeight);
const getUserAgent    = ClientFunction(() => navigator.userAgent.toString());
const iPhoneSize      = { width: 480, height: 320 };

var initialWindowSize = {};


fixture `Resize window`
    .page `http://localhost:3000/api/es-next/resize-window/pages/index.html`
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

        await t
            .resizeWindow(size.width, size.height);
    });

test('Resize the window', async t => {
    var newWidth  = 500;
    var newHeight = 500;

    await t.resizeWindow(newWidth, newHeight);

    expect(await getWindowWidth()).equals(newWidth);
    expect(await getWindowHeight()).equals(newHeight);
});

test('Incorrect action height argument', async t => {
    await t.resizeWindow(500, -5);
});

test('Resize the window to fit a device', async t => {
    await t.resizeWindowToFitDevice('iPhone');

    expect(await getWindowWidth()).equals(iPhoneSize.width);
    expect(await getWindowHeight()).equals(iPhoneSize.height);
});

test('Resize the window to fit a device with portrait orientation', async t => {
    await t.resizeWindowToFitDevice('iPhone', { portraitOrientation: true });

    expect(await getWindowWidth()).equals(iPhoneSize.height);
    expect(await getWindowHeight()).equals(iPhoneSize.width);
});

test('Incorrect action device argument', async t => {
    await t.resizeWindowToFitDevice('iPhone555');
});
