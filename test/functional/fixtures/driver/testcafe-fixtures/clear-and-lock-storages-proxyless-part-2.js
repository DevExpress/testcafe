import { ClientFunction } from 'testcafe';

const getStorageItem = ClientFunction((storageName, itemName) => {
    return window[storageName].getItem(itemName);
});

const setStorageItem = ClientFunction((storageName, itemName, value) => {
    window[storageName].setItem(itemName, value);
});

fixture `Should clear out the localStorage and sessionStorage for multiple domains`;

const page1 = 'http://localhost:3000/fixtures/driver/pages/empty-page.html';
const page2 = 'http://localhost:3001/fixtures/driver/pages/empty-page.html';

test.page(page1)(`Set storages`, async t => {
    await setStorageItem('localStorage', 'test3000', '1234567890');
    await setStorageItem('sessionStorage', 'test3000', '1234567890');

    await t.navigateTo(page2);

    await setStorageItem('localStorage', 'test3001', '1234567890');
    await setStorageItem('sessionStorage', 'test3001', '1234567890');

    await t.navigateTo(page1);

    await t.expect(getStorageItem('localStorage', 'test3000')).eql('1234567890');
    await t.expect(getStorageItem('sessionStorage', 'test3000')).eql('1234567890');
    await t.expect(getStorageItem('localStorage', 'test3001')).eql(null);
    await t.expect(getStorageItem('sessionStorage', 'test3001')).eql(null);

    await t.navigateTo(page2);

    await t.expect(getStorageItem('localStorage', 'test3000')).eql(null);
    await t.expect(getStorageItem('sessionStorage', 'test3000')).eql(null);
    await t.expect(getStorageItem('localStorage', 'test3001')).eql('1234567890');
    await t.expect(getStorageItem('sessionStorage', 'test3001')).eql('1234567890');
});

test.page(page1)(`Get storages`, async t => {
    await t.expect(getStorageItem('localStorage', 'test3000')).eql(null);
    await t.expect(getStorageItem('sessionStorage', 'test3000')).eql(null);

    await t.navigateTo(page2);
    await t.expect(getStorageItem('localStorage', 'test3001')).eql(null);
    await t.expect(getStorageItem('sessionStorage', 'test3001')).eql(null);
});
