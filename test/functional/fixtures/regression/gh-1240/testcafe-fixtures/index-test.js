import { Selector } from 'testcafe';

fixture `gh-1240`
    .page `http://localhost:3000/fixtures/regression/gh-1240/pages/index.html`;

test('Check a non-existent child', async t => {
    const span = Selector('#div').child(2);

    await t.expect(span.exists).notOk();
});
