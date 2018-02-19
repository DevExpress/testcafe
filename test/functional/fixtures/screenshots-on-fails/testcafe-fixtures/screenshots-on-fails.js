import { expect } from 'chai';
import { saveWindowState, restoreWindowState } from '../../../window-helpers';


// NOTE: to preserve callsites, add new tests AFTER the existing ones
fixture `Screenshots on fails`
    .page `http://localhost:3000/fixtures/screenshots-on-fails/pages/index.html`;

test('Screenshot on the ensureElement method fail', async t => {
    await t.click('#notExist');
});

test('Screenshot on page error', async t => {
    await t.click('#raiseError');
});

test('Screenshot on test code error', async () => {
    throw new Error('Custom error');
});

test('Screenshot on the assertion fail', async () => {
    expect(true).equals(false);
});

test('Test for quarantine mode', async t => {
    await t.click('#notExist');
});

test
    .page('../pages/crop.html')
    .before(async t => {
        await saveWindowState(t);

        await t.maximizeWindow();
    })
    .after(t => restoreWindowState(t))
    ('Crop screenshots', () => {
        throw new Error('Custom error');
    });
