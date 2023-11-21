import { Selector } from 'testcafe';

fixture `GH-8054 - Should not ignore request from service worker`
    .page `http://localhost:3000/fixtures/regression/gh-8054/pages/index.html`;

test(`Recreate invisible element and click`, async t => {
    // NOTE: we need this line for the test. For some reason
    // service worker is not registered on first loading
    await t.eval(() => window.location.reload());

    await t.click('button');
    await t.expect(Selector('h1').innerText).eql('Success');
});
