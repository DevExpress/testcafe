import { test } from 'testcafe';

fixture `Test`
    .page `http://localhost:3000/fixtures/api/es-next/test/pages/index.html`;

test('Test', async t => {
    await t
        .click('#button1');
});
