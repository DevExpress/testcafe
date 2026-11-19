import { ClientFunction } from 'testcafe';

const getStorageItem = ClientFunction(itemName => {
    return window.localStorage.getItem(itemName);
});

const setStorageItem = ClientFunction((itemName, value) => {
    window.localStorage.setItem(itemName, value);
});

fixture `Should clear out the localStorage of a cross-site iframe`
    .page `http://localhost:3000/fixtures/driver/pages/cross-site-iframe.html`;

test(`Set storages`, async t => {
    await setStorageItem('top', '1234567890');

    await t.switchToIframe('#iframe');

    await setStorageItem('iframe', '1234567890');

    await t.expect(getStorageItem('iframe')).eql('1234567890');
});

test(`Get storages`, async t => {
    await t.expect(getStorageItem('top')).eql(null);

    await t.switchToIframe('#iframe');

    await t.expect(getStorageItem('iframe')).eql(null);
});
