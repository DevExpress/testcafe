import { ClientFunction } from 'testcafe';

fixture `Storages`
    .page `http://localhost:3000/fixtures/driver/pages/set-value-to-storages.html`;

const setNativeStorageKey = ClientFunction(storageName => {
    const nativeStorage    = window[storageName].internal.nativeStorage;
    const nativeStorageKey = window[storageName].internal.nativeStorageKey;
    const nativeMethods    = window['%hammerhead%'].nativeMethods;

    nativeMethods.storageSetItem.call(nativeStorage, 'stored-native-storage-key', nativeStorageKey);
});

const getNativeStorageState = ClientFunction(storageName => {
    const nativeStorage = window[storageName].internal.nativeStorage;
    const nativeMethods = window['%hammerhead%'].nativeMethods;

    return nativeMethods.storageGetItem.call(nativeStorage,
        nativeMethods.storageGetItem.call(nativeStorage, 'stored-native-storage-key'));
});

test('Set values to storages', async t => {
    await setNativeStorageKey('localStorage');
    await setNativeStorageKey('sessionStorage');

    await t
        .click('a')
        .expect(getNativeStorageState('localStorage')).eql('[["qwerty"],["123456"]]')
        .expect(getNativeStorageState('sessionStorage')).eql('[["qazwsx"],["edcrfv"]]');
});

test('Check that storages is cleaned after first test', async t => {
    await t
        .expect(getNativeStorageState('localStorage')).eql(null)
        .expect(getNativeStorageState('sessionStorage')).eql(null);
});
