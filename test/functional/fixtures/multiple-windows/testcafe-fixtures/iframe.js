import { Selector } from 'testcafe';

fixture `iFrames`
    .page `http://localhost:3000/fixtures/multiple-windows/pages/frame/parent.html`;

test('Open child window if iframe', async t => {
    await t.switchToIframe('iframe');

    await t.click(Selector('button').withText('frame'));

    await t.click('a');

    await t.click(Selector('button').withText('child'));

    await t.switchToPreviousWindow();

    await t.click(Selector('button').withText('parent'));

    await t.switchToPreviousWindow();

    await t.click(Selector('button').withText('child'));
});
