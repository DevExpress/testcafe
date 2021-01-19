// import { Selector } from 'testcafe';
//
// fixture `Fixture`
//     .page('http://localhost:8080/index.html');
//
// test('test', async t => {
//     await t
//         .click('a')
//         .click('button')
//         .expect(Selector('sdf').exists).ok();
// });

import { Selector, ClientFunction } from 'testcafe';

fixture `Devexpress`
    .page('https://www.devexpress.com');

test('Switch to the previous window', async t => {
    const testcafe = await t.openWindow('http://devexpress.github.io/testcafe')
        .switchToPreviousWindow()
        .openWindow('http://devexpress.github.io/testcafe/documentation/');
});
