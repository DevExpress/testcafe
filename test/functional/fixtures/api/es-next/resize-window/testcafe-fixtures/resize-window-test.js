// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { Hybrid } from 'testcafe';
import { expect } from 'chai';

const getWindowWidth  = Hybrid(() => window.innerWidth);
const getWindowHeight = Hybrid(() => window.innerHeight);
const iPhoneSize      = { width: 480, height: 320 };

var initialWindowWidth  = null;
var initialWindowHeight = null;


fixture `Resize window`
    .page `http://localhost:3000/api/es-next/resize-window/pages/index.html`
    .beforeEach(async () => {
        initialWindowWidth  = await getWindowWidth();
        initialWindowHeight = await getWindowHeight();
    })
    .afterEach(async t => {
        await t
            .resizeWindow(initialWindowWidth, initialWindowHeight);
    });

test('Resize the window', async t => {
    var newWidth  = initialWindowWidth - 50;
    var newHeight = initialWindowHeight - 50;

    await t.resizeWindow(newWidth, newHeight);

    expect(await getWindowWidth()).equals(newWidth);
    expect(await getWindowHeight()).equals(newHeight);
});

test('Resize the window to fit a device', async t => {
    await t.resizeWindowToFitDevice('iPhone');

    expect(await getWindowWidth()).equals(iPhoneSize.width);
    expect(await getWindowHeight()).equals(iPhoneSize.height);
});

test('Resize the window to fit a device with portrait orientation', async t => {
    await t.resizeWindowToFitDevice('iPhone', true);

    expect(await getWindowWidth()).equals(iPhoneSize.height);
    expect(await getWindowHeight()).equals(iPhoneSize.width);
});
