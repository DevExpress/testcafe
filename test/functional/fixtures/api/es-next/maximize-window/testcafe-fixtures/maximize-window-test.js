import { expect } from 'chai';
import { ClientFunction } from 'testcafe';
import { saveWindowState, restoreWindowState } from '../../../../../window-helpers';


const getWindowDimensionsInfo = ClientFunction(() => {
    return {
        innerWidth:      window.innerWidth,
        innerHeight:     window.innerHeight,
        outerWidth:      window.outerWidth,
        outerHeight:     window.outerHeight,
        availableHeight: screen.availHeight,
        availableWidth:  screen.availWidth
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

test('Maximize window', async t => {
    await t.maximizeWindow();

    var dimensions = await getWindowDimensionsInfo();

    expect(dimensions.outerWidth).to.be.at.least(dimensions.availableWidth);
    expect(dimensions.outerHeight).to.be.at.least(dimensions.availableHeight);
});
