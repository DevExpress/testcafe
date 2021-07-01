import { test } from 'testcafe';

fixture `Test`
    .page `http://localhost:3000/fixtures/api/es-next/test-structure/pages/index.html`;

test('"test" should be imported', async t => {
    await t
        .click('#button1');
});
