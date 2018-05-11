import { Selector } from 'testcafe';

fixture `GH-2391 - should scroll to element if it is hidden by fixed`
    .page `http://localhost:3000/fixtures/regression/gh-2391/pages/index.html`;

test('click on button hidden by fixed div', async t => {
    await t
        .click('button')
        .expect(Selector('#result').innerText).eql('success');
});

