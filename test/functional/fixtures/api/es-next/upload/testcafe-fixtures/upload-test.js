import { expect } from 'chai';
import { ClientFunction } from 'testcafe';


fixture `Upload`
    .page `http://localhost:3000/fixtures/api/es-next/upload/pages/index.html`;

const getUploadedText = ClientFunction(() => document.getElementById('uploadedContent').textContent.trim());

test('Upload the file', async t => {
    await t
        .setFilesToUpload('#file', '../test-data/file1.txt')
        .click('#submit');

    expect(await getUploadedText()).equals('File 1 is uploaded!');
});

test('Clear the upload', async t => {
    await t
        .setFilesToUpload('#file', '../test-data/file1.txt')
        .clearUpload('#file')
        .click('#submit');

    expect(await getUploadedText()).equals('');
});

test('Invalid selector argument (setFilesToUpload)', async t => {
    await t.setFilesToUpload(void 0, '../test-data/file1.txt');
});

test('Invalid filePath argument', async t => {
    await t.setFilesToUpload('#file', '');
});

test('Invalid selector argument (clearUpload)', async t => {
    await t.clearUpload(null);
});

test('Error on upload non-existing file', async t => {
    await t.setFilesToUpload('#file', ['../dummy-file-1.txt', '../dummy-file-2.txt']);
});

test('Upload the file with required input', async t => {
    await t
        .setFilesToUpload('#fileRequired', '../test-data/file1.txt')
        .click('#submitRequired');

    expect(await getUploadedText()).equals('File 1 is uploaded!');
});

test('Upload the xls file', async t => {
    const file1SizeBytes = 6971392;

    await t
        .setFilesToUpload('#fileAlternative', '../test-data/file1.xls');

    expect(Number(await getUploadedText())).to.be.at.least(file1SizeBytes);
});
