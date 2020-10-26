// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { ClientFunction } from 'testcafe';
import { expect } from 'chai';

import {
    saveWindowState,
    restoreWindowState,
    getWindowHeight,
    getWindowWidth
} from '../../../../../window-helpers';


const setWindowOnresizeHandler = ClientFunction(() => {
    window.onresize = function () {
        throw new Error('Resize error');
    };
});

const resetWindowOnresizeHandler = ClientFunction(() => {
    window.onresize = function () {
    };
});

const iPhoneSize = { width: 480, height: 320 };

fixture `Resize the window`
    .page `http://localhost:3000/fixtures/api/es-next/resize-window/pages/index.html`
    .beforeEach(async t => {
        await saveWindowState(t);
    })
    .afterEach(async t => {
        await resetWindowOnresizeHandler();

        await restoreWindowState(t);
    });

test('Resize the window', async t => {
    const newWidth  = 500;
    const newHeight = 500;

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
    // NOTE: Firefox 74 cannot set its width less than ~450px in both the headless and non-headless modes.
    const iPadSize = { width: 1024, height: 768 };

    await t.resizeWindowToFitDevice('iPad', { portraitOrientation: true });

    expect(await getWindowWidth()).equals(iPadSize.height);
    expect(await getWindowHeight()).equals(iPadSize.width);
});


test('Incorrect action device argument', async t => {
    await t.resizeWindowToFitDevice('iPhone555');
});

test('Resize the window leads to js-error', async t => {
    await setWindowOnresizeHandler();

    await t.resizeWindow(500, 500);
});

test('Resize the window to fit a device leads to js-error', async t => {
    await setWindowOnresizeHandler();

    await t.resizeWindowToFitDevice('iPhone');
});

test('Too big size', async t => {
    const hugeWidth  = 100000;
    const hugeHeight = 100000;

    await t.resizeWindow(hugeWidth, hugeHeight);
});
