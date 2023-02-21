import { Selector } from 'testcafe';

fixture `Read-only input`
    .page `http://localhost:3000/fixtures/api/es-next/type/pages/read-only.html`;

test('Type into read-only input', async t => {
    await t
        .typeText('#input', 'a')
        .expect(Selector('#input').value).eql('');
});
