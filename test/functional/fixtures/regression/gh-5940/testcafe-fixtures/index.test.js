import { ClientFunction, Selector, t } from 'testcafe';

fixture `Check modifier keys`
    .page('http://localhost:3000/fixtures/regression/gh-xxx/pages/index.html');

async function uncheckIfNecessary(selector) {
    if (selector.checked) {
        return await t.click(selector);
    }
}

test('Press the ctrl+shift++ key combo', async t => {
    const selector = await Selector('#ctrlshiftplus');

    await t.pressKey('ctrl+shift++');
    await t.expect(selector.checked).eql(true);

    await uncheckIfNecessary(selector);

    await t.pressKey('ctrl+shift+\+');
    await t.expect(selector.checked).eql(true);

    await uncheckIfNecessary(selector);

    await t.pressKey('ctrl+shift+plus');
    await t.expect(selector.checked).eql(true);
});

test('Press the ctrl++ key combo', async t => {
    const selector = await Selector('#ctrlplus');

    await t.pressKey('ctrl++');
    await t.expect(selector.checked).eql(false);

    await uncheckIfNecessary(selector);

    await t.pressKey('ctrl+\+');
    await t.expect(selector.checked).eql(true);

    await uncheckIfNecessary(selector);

    await t.pressKey('ctrl+plus');
    await t.expect(selector.checked).eql(false);
});

test('Press the shift++ key combo', async t => {

    const selector = await Selector('#shiftplus');

    await t.pressKey('shift++');
    await t.expect(selector.checked).eql(true);

    await uncheckIfNecessary(selector);

    await t.pressKey('shift+\+');
    await t.expect(selector.checked).eql(true);

    await uncheckIfNecessary(selector);

    await t.pressKey('shift+plus');
    await t.expect(selector.checked).eql(true);

});

test('Press the + key', async t => {

    const selector = await Selector('#plus');

    await t.pressKey('+');
    await t.expect(selector.checked).eql(false);

    await uncheckIfNecessary(selector);

    await t.pressKey('\+');
    await t.expect(selector.checked).eql(true);

    await uncheckIfNecessary(selector);

    await t.pressKey('plus');
    await t.expect(selector.checked).eql(false);

});

test('Press the alt++ key combo', async t => {

    const selector = await Selector('#altplus');

    await t.pressKey('alt++');
    await t.expect(selector.checked).eql(false);

    await uncheckIfNecessary(selector);

    await t.pressKey('alt+\+');
    await t.expect(selector.checked).eql(true);

    await uncheckIfNecessary(selector);

    await t.pressKey('alt+plus');
    await t.expect(selector.checked).eql(false);

});
