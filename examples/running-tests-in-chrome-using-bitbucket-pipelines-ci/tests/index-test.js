import { Selector } from 'testcafe';

fixture `Check if the button text changes`
    .page `http://localhost:9090/index.html`;

test('My test', async t => {
    await t
        .click('#click-here')
        .expect(Selector('#click-here').value).eql('Hello!');
});
