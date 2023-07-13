import { ClientFunction } from 'testcafe';

fixture('Fixture')
    .page('http://localhost:3000/fixtures/regression/gh-5992/page1.html');

const setLocalStorageItem = ClientFunction(() => {
    window.localStorage.setItem('foo', 'bar');
});

const getLocalStorageItem = ClientFunction(() => {
    return window.localStorage.getItem('foo');
});

test('test', async t => {
    await setLocalStorageItem();

    const valueOnPage1 = await getLocalStorageItem();

    await t.navigateTo('page2.html');

    const valueOnPage2 = await getLocalStorageItem();

    await t.expect(valueOnPage1).eql(valueOnPage2);
});
