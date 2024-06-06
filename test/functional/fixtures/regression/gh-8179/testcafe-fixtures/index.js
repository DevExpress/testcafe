import { Selector } from 'testcafe';

fixture`GH-8179 - Should click on a two-word link split over two lines`
    .page`http://localhost:3000/fixtures/regression/gh-8179/pages/index.html`;

test('Click on a split link', async t => {
    await t
        .click('.main a')
        .expect(Selector('h1').innerText).eql('success');
});
