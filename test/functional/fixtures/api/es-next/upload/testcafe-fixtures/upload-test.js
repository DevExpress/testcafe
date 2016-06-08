import { expect } from 'chai';
import { ClientFunction } from 'testcafe';


fixture `Upload`
    .page `http://localhost:3000/api/es-next/upload/pages/index.html`;

const getUploadedText = ClientFunction(() => document.getElementById('uploadedContent').textContent.trim());

test('Upload the file', async t => {
    await t
        .uploadFile('#file', '../test-data/file1.txt')
        .click('#submit');

    expect(await getUploadedText()).equals('File 1 is uploaded!');
});

test('Clear the upload', async t => {
    await t
        .uploadFile('#file', '../test-data/file1.txt')
        .clearUpload('#file')
        .click('#submit');

    expect(await getUploadedText()).equals('');
});

test('Invalid selector argument (uploadFile)', async t => {
    await t.uploadFile(void 0, '../test-data/file1.txt');
});

test('Invalid filePath argument', async t => {
    await t.uploadFile('#file', '');
});

test('Invalid selector argument (clearUpload)', async t => {
    await t.clearUpload(null);
});
