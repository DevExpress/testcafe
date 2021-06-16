import {t, Selector } from 'testcafe';

fixture `Pseudo-element-click`
    .page `./index.html`;

test('pseudo', async t => {
    //await t.click('#popUp::after', { speed: 0.1 });
    //await t.rightClick('#popUp::after', { speed: 0.1 });
    //await t.doubleClick('#popUp::after');
    await t.hover('#popUp::after', { speed: 0.1 });
});
