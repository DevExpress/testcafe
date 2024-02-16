import { expect } from 'chai';
import { getWindowHeight, getWindowWidth } from '../../../../esm-utils/window-helpers.js';

fixture `Resize window`
    .page `http://localhost:3000/fixtures/regression/gh-8117/pages/index.html`;

test('Resize window', async t => {
    const newWidth  = 500;
    const newHeight = 500;

    await t.resizeWindow(newWidth, newHeight);

    expect(await getWindowWidth()).equals(newWidth);
    expect(await getWindowHeight()).equals(newHeight);
});
