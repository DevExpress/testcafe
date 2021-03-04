import { ClientFunction } from 'testcafe';

fixture `Features`;

const fn = ClientFunction(() => {
    var counter = window['counter'] || 0; // eslint-disable-line no-var

    counter++;

    window['counter'] = counter;

    return counter;
});

test('ClientFunction in assertions', async t => {
    await t.expect(fn()).eql(2);
});
