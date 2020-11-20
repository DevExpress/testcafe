import { getViewportSize } from 'device-specs';
import { getWindowHeight, getWindowWidth } from '../../../../window-helpers';

fixture `Resize in emulation`
    .page `http://localhost:3000/fixtures/multiple-windows/pages/features/emulation/index.html`;

test('Should resize window when emulating device', async t => {
    const width  = await getWindowWidth();
    const height = await getWindowHeight();

    const { portraitWidth, landscapeWidth } = getViewportSize('iPhone X');

    await t.expect(width).eql(portraitWidth);
    await t.expect(height).eql(landscapeWidth);
});

