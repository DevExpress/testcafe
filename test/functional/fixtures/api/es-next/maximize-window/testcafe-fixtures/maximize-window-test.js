import { expect } from 'chai';
import { ClientFunction } from 'testcafe';
import { saveWindowState, restoreWindowState } from '../../../../../esm-utils/window-helpers.js';


const getWindowDimensionsInfo = ClientFunction(() => {
    return {
        innerWidth:      window.innerWidth,
        innerHeight:     window.innerHeight,
        outerWidth:      window.outerWidth,
        outerHeight:     window.outerHeight,
        availableHeight: screen.availHeight,
        availableWidth:  screen.availWidth,
    };
});

const INITIAL_SIZE = 500;

fixture `Maximize Window`
    .page `http://localhost:3000/fixtures/api/es-next/maximize-window/pages/index.html`
    .beforeEach(async t => {
        await saveWindowState(t);

        await t.resizeWindow(INITIAL_SIZE, INITIAL_SIZE);
    })
    .afterEach(async t => {
        await restoreWindowState(t);
    });

test('Maximize window (Chrome)', async t => {
    const browserConnection = t.testRun.browserConnection;
    const browser           = browserConnection.provider.plugin.openedBrowsers[browserConnection.id];
    const client            = await browser.browserClient.getActiveClient();

    const { windowId } = await client.Browser.getWindowForTarget({});

    // NOTE: maximize via CDP API
    await client.Browser.setWindowBounds({ windowId, bounds: { windowState: 'maximized' } });

    const { innerWidth: maxWidth, innerHeight: maxHeight } = await getWindowDimensionsInfo();

    // NOTE: add timeout to give CDP time to make resize
    await t.wait(100);

    // NOTE: minimize via CDP API
    await client.Browser.setWindowBounds({
        windowId,
        bounds: { windowState: 'normal', height: 1, width: 1, left: 1, top: 1 },
    });

    const { innerWidth: minWidth, innerHeight: minHeight } = await getWindowDimensionsInfo();

    // NOTE: ensure that maximize/minimize via CDP is working
    await t.expect(maxWidth).gt(minWidth);
    await t.expect(maxHeight).gt(minHeight);

    // NOTE: maximize via TestCafe API
    await t.maximizeWindow();

    const { innerWidth: calculatedWidth, innerHeight: calculatedHeight } = await getWindowDimensionsInfo();

    // NOTE: check calculate properties are equal to max properties
    // sometimes values are not equal, so error equals to 1 is acceptable
    await t.expect(Math.abs(calculatedWidth - maxWidth)).lte(1);
    await t.expect(Math.abs(calculatedHeight - maxHeight)).lte(1);
});

test('Maximize window (Other)', async t => {
    await t.maximizeWindow();

    const dimensions = await getWindowDimensionsInfo();

    expect(dimensions.innerWidth).to.be.at.least(dimensions.availableWidth);
    expect(dimensions.innerHeight).to.be.at.least(dimensions.availableHeight);
});
