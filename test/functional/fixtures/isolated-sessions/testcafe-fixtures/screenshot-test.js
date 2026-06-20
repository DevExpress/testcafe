import * as fs from 'fs';

fixture `Isolated Sessions - Screenshots`
    .page('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

test('takeScreenshot', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    const filePath = await t2.takeScreenshot();

    await t.expect(typeof filePath).eql('string');
    await t.expect(filePath.endsWith('.png')).ok();
    await t.expect(fs.existsSync(filePath)).ok();

    // Cleanup
    fs.unlinkSync(filePath);
});

test('takeElementScreenshot', async t => {
    const t2 = await t.openIsolatedSession();

    await t2.navigateTo('http://localhost:3000/fixtures/isolated-sessions/pages/index.html');

    const filePath = await t2.takeElementScreenshot('#btn');

    await t.expect(typeof filePath).eql('string');
    await t.expect(filePath.endsWith('.png')).ok();
    await t.expect(fs.existsSync(filePath)).ok();

    // Cleanup
    fs.unlinkSync(filePath);
});
