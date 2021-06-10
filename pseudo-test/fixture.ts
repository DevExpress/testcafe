import {t, Selector } from 'testcafe';

fixture `Pseudo-element-click`
    .page `./index.html`;

test('pseudo', async t => {
    await t.click('#popUp::after', { speed: 0.10/*, offsetX: 250, offsetY: -250*/ });
});
