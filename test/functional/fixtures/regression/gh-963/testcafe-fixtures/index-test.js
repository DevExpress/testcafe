import { expect } from 'chai';
import { Selector } from 'testcafe';

fixture `gh-963`
    .page `http://localhost:3000/fixtures/regression/gh-963/pages/index.html`;

const getUploadedText = async () => (await Selector('#uploadedContent').textContent).trim();

test('Call setFilesToUpload and clearUpload for a hidden input', async t => {
    await t
        .setFilesToUpload('#file', '../test-data/file1.txt')
        .clearUpload('#file')
        .click('#submit');

    expect(await getUploadedText()).equals('');
});
