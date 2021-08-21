import { fixture } from 'testcafe';

fixture `Fixture`
    .page `http://localhost:3000/fixtures/api/es-next/test-structure/pages/index.html`;

test('"fixture" should be imported', async t => {
    await t
        .click('#button1');
});
