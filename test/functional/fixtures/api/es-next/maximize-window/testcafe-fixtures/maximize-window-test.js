import { expect } from 'chai';
import { ClientFunction } from 'testcafe';

fixture `Maximize Window`
    .page `http://localhost:3000/fixtures/api/es-next/maximize-window/pages/index.html`;


const getWindowDimensionsInfo = ClientFunction(() => {
    return {
        width:           window.outerWidth,
        height:          window.outerHeight,
        availableHeight: screen.availHeight,
        availableWidth:  screen.availWidth
    };
});

test('Maximize window', async t => {
    await t.maximizeWindow();

    var dimensions = await getWindowDimensionsInfo();

    expect(dimensions.width).to.be.at.least(dimensions.availableWidth);
    expect(dimensions.height).to.be.at.least(dimensions.availableHeight);
});
