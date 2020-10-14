import { Selector } from 'testcafe';

fixture `Fixture`
    .page('http://localhost:3000/fixtures/hammerhead/gh-2418/pages/index.html');

test('the "gh2418" should be the last child', async t => {
    const body = Selector('body').addCustomDOMProperties({
        lastChildId: el => el.lastChild.id
    });

    await t
        .expect(body.lastChildId).eql('gh2418');
});
