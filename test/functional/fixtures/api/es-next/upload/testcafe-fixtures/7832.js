import { ClientFunction } from 'testcafe';

fixture `Fixture`
    .page `http://localhost:3000/fixtures/api/es-next/upload/pages/7832.html`;

const getInputValue = ClientFunction(() => {
    return document.querySelector('#file').value;
});

test('test', async t => {
    await t
        .setFilesToUpload('#file', '../test-data/file1.txt')
        .expect(getInputValue()).eql('C:\\fakepath\\file1.txt');
});
