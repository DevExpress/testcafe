import { ClientFunction } from 'testcafe';

fixture `Storages`
    .page `http://localhost:3000/fixtures/driver/pages/set-value-to-storages.html`;

const getStorageState = ClientFunction(storageName => {
    return JSON.stringify([ Object.keys(window[storageName]), Object.values(window[storageName])]);
});

test('Set values to storages', async t => {
    await t
        .click('a')
        .expect(getStorageState('localStorage')).eql('[["qwerty"],["123456"]]')
        .expect(getStorageState('sessionStorage')).eql('[["qazwsx"],["edcrfv"]]');
});

test
    .page('http://localhost:3000/fixtures/driver/pages/empty-page.html')
    ('Check that storages is cleaned after first test', async t => {
        await t
            .expect(getStorageState('localStorage')).eql('[[],[]]')
            .expect(getStorageState('sessionStorage')).eql('[[],[]]');
    });
