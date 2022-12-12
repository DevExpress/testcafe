import { Selector } from 'testcafe';

fixture `Worker`
    .page `http://localhost:3000/fixtures/hammerhead/worker/pages/index.html`;

test('test', async t => {
    await t
        .typeText('#first', '2')
        .typeText('#second', '3')
        .expect(Selector('#result').value).eql('6');
});
