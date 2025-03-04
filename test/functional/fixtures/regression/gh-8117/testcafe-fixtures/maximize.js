/* eslint-disable no-console */
import { expect } from 'chai';
import { ClientFunction } from 'testcafe';

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

fixture `Maximize Window`
    .page `http://localhost:3000/fixtures/regression/gh-8117/pages/index.html`;

test('Maximize window', async t => {
    await t.maximizeWindow();

    const dimensions = await getWindowDimensionsInfo();

    console.log(dimensions);

    expect(dimensions.outerWidth).to.be.at.least(dimensions.availableWidth);
    expect(dimensions.outerHeight).to.be.at.least(dimensions.availableHeight);
});
