/* eslint-disable no-console */
import { expect } from 'chai';
import { getWindowHeight, getWindowWidth } from '../../../../esm-utils/window-helpers.js';
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

fixture `Resize window`
    .page `http://localhost:3000/fixtures/regression/gh-8117/pages/index.html`;

test('Resize window', async t => {
    const newWidth  = 500;
    const newHeight = 500;
    const dimensionsBefore = await getWindowDimensionsInfo();

    await t.resizeWindow(newWidth, newHeight);

    const dimensionsAfter = await getWindowDimensionsInfo();

    console.log('Before');
    console.log(dimensionsBefore);
    console.log('After');
    console.log(dimensionsAfter);

    expect(await getWindowWidth()).equals(newWidth);
    expect(await getWindowHeight()).equals(newHeight);
});
