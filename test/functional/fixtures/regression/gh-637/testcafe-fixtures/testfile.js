import { ClientFunction } from 'testcafe';

const getLocation = ClientFunction(() => document.location.toString());

fixture `Some fixture`;

test('Some test', async t => {
    await t.wait(30);

    await getLocation();

    return Promise.resolve();
});
