import { Selector, ClientFunction } from 'testcafe';

const reload = ClientFunction(() => window.location.reload());
const close  = ClientFunction(() => window.close());

fixture `iFrames`
    .page `http://localhost:3000/fixtures/multiple-windows/pages/frame/parent.html`;

test('Open child window from iframe', async t => {
    await t.switchToIframe('iframe');

    await t.click(Selector('button').withText('frame'));

    await t.click(Selector('a').withExactText('open window and hide iframe'));

    await t.click(Selector('button').withText('child'));

    await t.switchToPreviousWindow();

    await t.click(Selector('button').withText('parent'));

    await t.switchToPreviousWindow();

    await t.click(Selector('button').withText('child'));
});

test('Reload child window opened from iframe', async t => {
    await t.switchToIframe('iframe');

    await t.click(Selector('a').withExactText('open window'));

    for (let i = 0; i < 10; i++)
        await reload();

    await close();

    await t.switchToIframe('iframe');

    await t.click('a');

    await close();
});
