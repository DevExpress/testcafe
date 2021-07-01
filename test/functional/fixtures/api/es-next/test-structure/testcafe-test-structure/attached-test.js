import { fixture, test } from 'testcafe';

fixture `Attached tests`
    .page `http://localhost:3000/fixtures/api/es-next/test-structure/pages/index.html`;

test('Attached tests should work', async t => {
    await t
        .click('#button1');
});
