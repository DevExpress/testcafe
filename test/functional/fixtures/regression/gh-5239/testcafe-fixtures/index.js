import { Selector } from 'testcafe';

fixture `GH-5239 - Should make multiple request for the page if the server does not respond`
    .page `http://localhost:1340`;

test(`Click on the element`, async t => {
    await t.click(Selector('h1').withText('example'));
});
