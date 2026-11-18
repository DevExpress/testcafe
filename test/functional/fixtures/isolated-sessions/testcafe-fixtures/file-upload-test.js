import * as path from 'path';

fixture `Isolated Sessions - File Upload`
    .page('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

test('setFilesToUpload', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    const testFile = path.resolve(__dirname, '../pages/index.html');

    await t2.setFilesToUpload('#file-input', testFile);

    const fileCount = await t2.eval(() => document.querySelector('#file-input').files.length);
    const fileName  = await t2.eval(() => document.querySelector('#file-input').files[0].name);

    await t.expect(fileCount).eql(1);
    await t.expect(fileName).eql('index.html');
});
