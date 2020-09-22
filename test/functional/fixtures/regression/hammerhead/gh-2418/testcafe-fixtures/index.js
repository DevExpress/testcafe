import { Selector } from 'testcafe';

fixture `Fixture`
    .page('http://localhost:3000/fixtures/regression/hammerhead/gh-2418/pages/index.html');

test('the "div2" should be the last child', async t => {
    const body = Selector('body').addCustomDOMProperties({
        lastChildId: el => el.lastChild.id
    });

    await t
        .wait(500);

    await t
        .expect(body.lastChildId).eql('div2');
});
