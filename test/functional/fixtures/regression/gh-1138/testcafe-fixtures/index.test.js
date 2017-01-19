import { Selector } from 'testcafe';

fixture `GH-1138`
    .page('http://localhost:3000/fixtures/regression/gh-1138/pages/index.html');

test('Click on element bound to the right bottom corner', async t => {
    var target = Selector('#target');

    await t
        .click(target)
        .expect(target.textContent).eql('It works');
});
