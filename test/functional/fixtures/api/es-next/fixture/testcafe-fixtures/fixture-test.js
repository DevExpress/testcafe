import { fixture } from 'testcafe';

fixture `Fixture`
    .page `http://localhost:3000/fixtures/api/es-next/fixture/pages/index.html`;

test('Fixture', async t => {
    await t
        .click('#button1');
});
