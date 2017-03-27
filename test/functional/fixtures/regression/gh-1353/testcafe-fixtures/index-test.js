import { ClientFunction } from 'testcafe';

fixture `gh-1353`
    .page `http://localhost:3000/fixtures/regression/gh-1353/pages/index.html`;

const targetClicked = ClientFunction(() => window.targetClicked);

test('gh-1353', async t => {
    await t
        .click('#target')
        .expect(targetClicked()).ok();
});
